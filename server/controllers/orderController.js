const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Coupon = require('../models/Coupon');
const { validateCouponForUser } = require('./couponController');
const { sendOrderStatusEmail } = require('../services/emailService');
const { sendEventToUser } = require('../services/realtimeService');

const ORDER_STATUSES = ['Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
const CANCELLABLE_STATUSES = ['Placed', 'Confirmed'];

const SLA_DEFAULT_PREP_MINUTES = Number(process.env.SLA_PREP_MINUTES || 20);
const SLA_DEFAULT_DELIVERY_MINUTES = Number(process.env.SLA_DELIVERY_MINUTES || 25);

const isTransactionUnsupportedError = (error) => {
	const message = error?.message || '';
	return (
		message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
		message.includes('does not support retryable writes')
	);
};

const runWithOptionalTransaction = async (operation) => {
	const session = await mongoose.startSession();

	try {
		let result;
		await session.withTransaction(async () => {
			result = await operation(session);
		});
		return result;
	} catch (error) {
		if (isTransactionUnsupportedError(error)) {
			return operation(null);
		}
		throw error;
	} finally {
		await session.endSession();
	}
};

const isValidTransition = (currentStatus, nextStatus) => {
	const validTransitions = {
		Placed: ['Confirmed', 'Cancelled'],
		Confirmed: ['Preparing', 'Cancelled'],
		Preparing: ['Out for Delivery'],
		'Out for Delivery': ['Delivered'],
		Delivered: [],
		Cancelled: []
	};

	return validTransitions[currentStatus]?.includes(nextStatus);
};

const withSlaMetadata = (order) => {
	const plainOrder = typeof order.toObject === 'function' ? order.toObject() : order;
	const now = Date.now();
	const estimated = plainOrder.estimatedDeliveryAt ? new Date(plainOrder.estimatedDeliveryAt).getTime() : null;
	const terminal = ['Delivered', 'Cancelled'].includes(plainOrder.orderStatus);
	const etaMinutesRemaining = estimated ? Math.max(0, Math.ceil((estimated - now) / 60000)) : null;
	const delayMinutes = estimated && !terminal && now > estimated ? Math.ceil((now - estimated) / 60000) : 0;
	const isDelayed = delayMinutes > 0;
	const delaySeverity = delayMinutes >= 20 ? 'critical' : delayMinutes >= 10 ? 'warning' : 'none';
	const requiresEscalation = delaySeverity === 'critical';

	return {
		...plainOrder,
		etaMinutesRemaining,
		delayMinutes,
		isDelayed,
		delaySeverity,
		requiresEscalation
	};
};

const sendOrderCommunication = async ({ userId, orderId, title, message, status, note }) => {
	try {
		await Notification.create({
			userId,
			orderId,
			type: 'order_status',
			title,
			message
		});

		sendEventToUser(String(userId), 'notification_new', {
			orderId,
			title,
			message,
			status,
			createdAt: new Date().toISOString()
		});

		sendEventToUser(String(userId), 'order_update', {
			orderId,
			status,
			note: note || '',
			at: new Date().toISOString()
		});

		const user = await User.findById(userId).select('name email');
		if (user?.email) {
			await sendOrderStatusEmail({
				to: user.email,
				customerName: user.name,
				orderId,
				status,
				note
			});
		}
	} catch (error) {
		console.error('Order communication error:', error.message);
	}
};

const createOrder = async (req, res, next) => {
	try {
		const { items, deliveryAddress, paymentMethod = 'cod', couponCode } = req.body;

		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'At least one item is required to place an order'
			});
		}

		const normalizedItems = items
			.map((item) => {
				const productId = item.productId || item._id || item.id;
				const quantity = Number(item.quantity || 1);
				return { productId, quantity };
			})
			.filter((item) => item.productId && item.quantity > 0);

		if (normalizedItems.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'Invalid order items payload'
			});
		}

		const createdOrder = await runWithOptionalTransaction(async (session) => {
			const productIds = normalizedItems.map((item) => new mongoose.Types.ObjectId(item.productId));
			const productQuery = Product.find({ _id: { $in: productIds } });
			const products = session ? await productQuery.session(session) : await productQuery;
			const productById = new Map(products.map((product) => [product._id.toString(), product]));

			const orderItems = [];
			let subtotal = 0;

			for (const item of normalizedItems) {
				const product = productById.get(item.productId.toString());

				if (!product) {
					const notFoundError = new Error(`Product not found: ${item.productId}`);
					notFoundError.statusCode = 404;
					throw notFoundError;
				}

				if (!product.available) {
					const unavailableError = new Error(`${product.name} is currently unavailable`);
					unavailableError.statusCode = 400;
					throw unavailableError;
				}

				if (product.stock < item.quantity) {
					const stockError = new Error(`Insufficient stock for ${product.name}`);
					stockError.statusCode = 400;
					throw stockError;
				}

				orderItems.push({
					productId: product._id,
					name: product.name,
					flavor: product.flavor,
					size: product.size,
					price: product.price,
					quantity: item.quantity
				});

				subtotal += product.price * item.quantity;
			}

			let appliedCouponCode = '';
			let discountAmount = 0;

			if (couponCode) {
				const normalizedCode = String(couponCode).toUpperCase().trim();
				const couponQuery = Coupon.findOne({ code: normalizedCode });
				const coupon = session ? await couponQuery.session(session) : await couponQuery;

				if (!coupon) {
					const couponError = new Error('Coupon not found');
					couponError.statusCode = 404;
					throw couponError;
				}

				const validation = validateCouponForUser(coupon, subtotal, req.user._id);
				if (!validation.valid) {
					const couponError = new Error(validation.message);
					couponError.statusCode = 400;
					throw couponError;
				}

				discountAmount = validation.discount;
				appliedCouponCode = normalizedCode;

				const usageIndex = coupon.usedBy.findIndex((entry) => String(entry.userId) === String(req.user._id));
				if (usageIndex === -1) {
					coupon.usedBy.push({ userId: req.user._id, count: 1 });
				} else {
					coupon.usedBy[usageIndex].count += 1;
				}

				coupon.usedCount += 1;
				if (session) {
					await coupon.save({ session });
				} else {
					await coupon.save();
				}
			}

			const discountedSubtotal = Number((subtotal - discountAmount).toFixed(2));
			const tax = Number((discountedSubtotal * 0.05).toFixed(2));
			const deliveryFee = discountedSubtotal >= 299 ? 0 : 20;
			const totalAmount = Number((discountedSubtotal + tax + deliveryFee).toFixed(2));

			for (const item of normalizedItems) {
				const updateQuery = Product.findOneAndUpdate(
					{ _id: item.productId, stock: { $gte: item.quantity } },
					{ $inc: { stock: -item.quantity } },
					{ new: true }
				);
				const updatedProduct = session ? await updateQuery.session(session) : await updateQuery;

				if (!updatedProduct) {
					const stockRaceError = new Error('Stock changed while placing order. Please try again.');
					stockRaceError.statusCode = 409;
					throw stockRaceError;
				}
			}

			const promisedMinutes = SLA_DEFAULT_PREP_MINUTES + SLA_DEFAULT_DELIVERY_MINUTES;
			const estimatedDeliveryAt = new Date(Date.now() + promisedMinutes * 60000);

			const orderPayload = {
				userId: req.user._id,
				items: orderItems,
				subtotal: discountedSubtotal,
				couponCode: appliedCouponCode,
				discountAmount,
				tax,
				totalAmount,
				paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
				paymentMethod,
				orderStatus: 'Placed',
				promisedMinutes,
				estimatedDeliveryAt,
				deliveryAddress: deliveryAddress || {},
				statusHistory: [
					{
						status: 'Placed',
						note: 'Order placed by customer',
						changedBy: req.user._id
					}
				]
			};

			if (session) {
				const [order] = await Order.create([orderPayload], { session });
				return order;
			}

			return Order.create(orderPayload);
		});

		res.status(201).json({
			success: true,
			message: 'Order placed successfully',
			data: withSlaMetadata(createdOrder)
		});

		sendOrderCommunication({
			userId: createdOrder.userId,
			orderId: createdOrder._id,
			title: 'Order Placed',
			message: `Your order #${String(createdOrder._id).slice(-8).toUpperCase()} has been placed successfully.`,
			status: 'Placed'
		});
	} catch (error) {
		next(error);
	}
};

const getMyOrders = async (req, res, next) => {
	try {
		const orders = await Order.find({ userId: req.user._id })
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: orders.map(withSlaMetadata)
		});
	} catch (error) {
		next(error);
	}
};

const getAllOrdersAdmin = async (req, res, next) => {
	try {
		const orders = await Order.find({})
			.populate('userId', 'name email')
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: orders.map(withSlaMetadata)
		});
	} catch (error) {
		next(error);
	}
};

const getOrderById = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.id)
			.populate('userId', 'name email');

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		const isOwner = order.userId._id.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';

		if (!isOwner && !isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Access denied for this order'
			});
		}

		res.status(200).json({
			success: true,
			data: withSlaMetadata(order)
		});
	} catch (error) {
		next(error);
	}
};

const updateOrderStatus = async (req, res, next) => {
	try {
		const { status, note = '' } = req.body;

		if (!ORDER_STATUSES.includes(status)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid order status'
			});
		}

		const order = await Order.findById(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		if (!isValidTransition(order.orderStatus, status)) {
			return res.status(400).json({
				success: false,
				message: `Invalid transition from ${order.orderStatus} to ${status}`
			});
		}

		order.orderStatus = status;
		order.statusHistory = order.statusHistory || [];
		order.statusHistory.push({
			status,
			note: note || `Order status updated to ${status}`,
			changedBy: req.user._id
		});

		await order.save();

		sendOrderCommunication({
			userId: order.userId,
			orderId: order._id,
			title: `Order ${status}`,
			message: `Your order #${String(order._id).slice(-8).toUpperCase()} is now ${status}.`,
			status,
			note
		});

		res.status(200).json({
			success: true,
			message: 'Order status updated successfully',
			data: withSlaMetadata(order)
		});
	} catch (error) {
		next(error);
	}
};

const cancelOrder = async (req, res, next) => {
	try {
		const { reason = 'Cancelled by customer' } = req.body;

		const order = await Order.findById(req.params.id);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		const isOwner = order.userId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === 'admin';

		if (!isOwner && !isAdmin) {
			return res.status(403).json({
				success: false,
				message: 'Access denied for this order'
			});
		}

		if (!CANCELLABLE_STATUSES.includes(order.orderStatus) && !isAdmin) {
			return res.status(400).json({
				success: false,
				message: 'Order can only be cancelled in Placed or Confirmed status'
			});
		}

		if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Delivered') {
			return res.status(400).json({
				success: false,
				message: `Order already ${order.orderStatus}`
			});
		}

		const updatedOrder = await runWithOptionalTransaction(async (session) => {
			const orderQuery = Order.findById(req.params.id);
			const activeOrder = session ? await orderQuery.session(session) : await orderQuery;

			if (!activeOrder) {
				const notFoundError = new Error('Order not found');
				notFoundError.statusCode = 404;
				throw notFoundError;
			}

			if (activeOrder.orderStatus === 'Cancelled' || activeOrder.orderStatus === 'Delivered') {
				const stateError = new Error(`Order already ${activeOrder.orderStatus}`);
				stateError.statusCode = 400;
				throw stateError;
			}

			for (const item of activeOrder.items) {
				const updateQuery = Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
				if (session) {
					await updateQuery.session(session);
				} else {
					await updateQuery;
				}
			}

			activeOrder.orderStatus = 'Cancelled';
			activeOrder.statusHistory = activeOrder.statusHistory || [];
			activeOrder.statusHistory.push({
				status: 'Cancelled',
				note: reason,
				changedBy: req.user._id
			});

			if (session) {
				await activeOrder.save({ session });
			} else {
				await activeOrder.save();
			}

			return activeOrder;
		});

		res.status(200).json({
			success: true,
			message: 'Order cancelled successfully',
			data: withSlaMetadata(updatedOrder)
		});

		sendOrderCommunication({
			userId: updatedOrder.userId,
			orderId: updatedOrder._id,
			title: 'Order Cancelled',
			message: `Your order #${String(updatedOrder._id).slice(-8).toUpperCase()} was cancelled.`,
			status: 'Cancelled',
			note: reason
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createOrder,
	getMyOrders,
	getAllOrdersAdmin,
	getOrderById,
	updateOrderStatus,
	cancelOrder
};
