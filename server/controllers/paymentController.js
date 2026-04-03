const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const PaymentWebhookEvent = require('../models/PaymentWebhookEvent');
const { sendEventToUser } = require('../services/realtimeService');

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
	? new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET
	})
	: null;

const ensureOrderAccess = (order, user) => {
	const isOwner = order.userId.toString() === user._id.toString();
	const isAdmin = user.role === 'admin';
	return isOwner || isAdmin;
};

let reconciliationTimer = null;

const markOrderPaid = async (order, paymentMeta, changedBy) => {
	order.paymentStatus = 'paid';
	if (paymentMeta?.razorpayOrderId) {
		order.razorpayOrderId = paymentMeta.razorpayOrderId;
	}
	if (paymentMeta?.razorpayPaymentId) {
		order.razorpayPaymentId = paymentMeta.razorpayPaymentId;
	}
	order.statusHistory = order.statusHistory || [];
	order.statusHistory.push({
		status: order.orderStatus,
		note: paymentMeta?.note || 'Payment verified successfully',
		changedBy: changedBy || order.userId
	});
	await order.save();

	sendEventToUser(String(order.userId), 'payment_update', {
		orderId: order._id,
		paymentStatus: 'paid',
		paymentMethod: order.paymentMethod,
		at: new Date().toISOString()
	});
};

const markOrderPaymentFailed = async (order, note, changedBy) => {
	order.paymentStatus = 'failed';
	order.statusHistory = order.statusHistory || [];
	order.statusHistory.push({
		status: order.orderStatus,
		note: note || 'Payment failed',
		changedBy: changedBy || order.userId
	});
	await order.save();

	sendEventToUser(String(order.userId), 'payment_update', {
		orderId: order._id,
		paymentStatus: 'failed',
		paymentMethod: order.paymentMethod,
		at: new Date().toISOString()
	});
};

const reconcileOrderFromGateway = async (order, changedBy) => {
	if (!razorpay || !order?.razorpayOrderId) {
		return { state: 'noop', paymentStatus: order?.paymentStatus || 'pending' };
	}

	const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
	const capturedPayment = payments?.items?.find((item) => item.status === 'captured');
	const failedPayment = payments?.items?.find((item) => item.status === 'failed');

	if (capturedPayment) {
		if (order.paymentStatus !== 'paid') {
			await markOrderPaid(order, {
				razorpayOrderId: capturedPayment.order_id,
				razorpayPaymentId: capturedPayment.id,
				note: 'Payment reconciled from Razorpay records'
			}, changedBy || order.userId);
		}

		return {
			state: 'paid',
			paymentStatus: 'paid',
			razorpayPaymentId: capturedPayment.id
		};
	}

	if (failedPayment) {
		if (order.paymentStatus !== 'failed') {
			await markOrderPaymentFailed(order, 'Payment marked failed after reconciliation', changedBy || order.userId);
		}

		return { state: 'failed', paymentStatus: 'failed' };
	}

	return {
		state: 'pending',
		paymentStatus: order.paymentStatus,
		razorpayOrderId: order.razorpayOrderId
	};
};

const createPaymentOrder = async (req, res, next) => {
	try {
		if (!razorpay) {
			return res.status(503).json({
				success: false,
				message: 'Online payments are not configured on server'
			});
		}

		const { orderId } = req.body;

		if (!orderId) {
			return res.status(400).json({
				success: false,
				message: 'Order ID is required'
			});
		}

		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		if (!ensureOrderAccess(order, req.user)) {
			return res.status(403).json({
				success: false,
				message: 'Access denied for this order'
			});
		}

		if (order.paymentStatus === 'paid') {
			return res.status(400).json({
				success: false,
				message: 'Order is already paid'
			});
		}

		const razorpayOrder = await razorpay.orders.create({
			amount: Math.round(Number(order.totalAmount) * 100),
			currency: 'INR',
			receipt: `fd_${String(order._id).slice(-10)}`,
			notes: {
				orderId: String(order._id),
				userId: String(order.userId)
			}
		});

		order.razorpayOrderId = razorpayOrder.id;
		order.paymentStatus = 'pending';
		await order.save();

		return res.status(200).json({
			success: true,
			data: {
				keyId: process.env.RAZORPAY_KEY_ID,
				razorpayOrderId: razorpayOrder.id,
				amount: razorpayOrder.amount,
				currency: razorpayOrder.currency,
				orderId: order._id
			}
		});
	} catch (error) {
		next(error);
	}
};

const verifyPayment = async (req, res, next) => {
	try {
		const {
			orderId,
			razorpayOrderId,
			razorpayPaymentId,
			razorpaySignature
		} = req.body;

		if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
			return res.status(400).json({
				success: false,
				message: 'Missing payment verification payload'
			});
		}

		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		if (!ensureOrderAccess(order, req.user)) {
			return res.status(403).json({
				success: false,
				message: 'Access denied for this order'
			});
		}

		const expectedSignature = crypto
			.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
			.update(`${razorpayOrderId}|${razorpayPaymentId}`)
			.digest('hex');

		if (expectedSignature !== razorpaySignature) {
			await markOrderPaymentFailed(order, 'Payment signature verification failed', req.user._id);

			return res.status(400).json({
				success: false,
				message: 'Invalid payment signature'
			});
		}

		await markOrderPaid(order, {
			razorpayOrderId,
			razorpayPaymentId,
			note: 'Payment verified successfully'
		}, req.user._id);

		return res.status(200).json({
			success: true,
			message: 'Payment verified successfully',
			data: order
		});
	} catch (error) {
		next(error);
	}
};

const reconcilePayment = async (req, res, next) => {
	try {
		if (!razorpay) {
			return res.status(503).json({
				success: false,
				message: 'Online payments are not configured on server'
			});
		}

		const order = await Order.findById(req.params.orderId);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		if (!ensureOrderAccess(order, req.user)) {
			return res.status(403).json({
				success: false,
				message: 'Access denied for this order'
			});
		}

		if (!order.razorpayOrderId) {
			return res.status(400).json({
				success: false,
				message: 'No online payment initiated for this order'
			});
		}

		const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
		const result = await reconcileOrderFromGateway(order, req.user._id);

		return res.status(200).json({
			success: true,
			message: result.state === 'paid' ? 'Payment reconciled as paid' : 'Reconciliation completed',
			data: {
				orderId: order._id,
				...result
			}
		});
	} catch (error) {
		next(error);
	}
};

const razorpayWebhook = async (req, res, next) => {
	try {
		const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
		if (!webhookSecret) {
			return res.status(503).json({
				success: false,
				message: 'Razorpay webhook secret is not configured'
			});
		}

		const signature = req.headers['x-razorpay-signature'];
		const rawBody = req.body;
		const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');
		const webhookEventId = req.headers['x-razorpay-event-id'] || payloadHash;

		const expectedSignature = crypto
			.createHmac('sha256', webhookSecret)
			.update(rawBody)
			.digest('hex');

		if (expectedSignature !== signature) {
			return res.status(400).json({
				success: false,
				message: 'Invalid webhook signature'
			});
		}

		const event = JSON.parse(rawBody.toString('utf8'));
		const eventType = event?.event;
		const paymentEntity = event?.payload?.payment?.entity;
		const orderEntity = event?.payload?.order?.entity;

		try {
			await PaymentWebhookEvent.create({
				eventId: webhookEventId,
				eventType: eventType,
				source: 'razorpay',
				payloadHash
			});
		} catch (error) {
			if (error.code === 11000) {
				return res.status(200).json({
					success: true,
					message: 'Duplicate webhook ignored'
				});
			}
			throw error;
		}

		let order = null;
		const directOrderId = paymentEntity?.notes?.orderId || orderEntity?.notes?.orderId;

		if (directOrderId) {
			order = await Order.findById(directOrderId);
		}

		if (!order && paymentEntity?.order_id) {
			order = await Order.findOne({ razorpayOrderId: paymentEntity.order_id });
		}

		if (!order) {
			return res.status(200).json({
				success: true,
				message: 'Webhook received but no matching order found'
			});
		}

		await PaymentWebhookEvent.findOneAndUpdate(
			{ eventId: webhookEventId },
			{ orderId: order._id }
		);

		if ((eventType === 'payment.captured' || eventType === 'order.paid') && order.paymentStatus !== 'paid') {
			await markOrderPaid(order, {
				razorpayOrderId: paymentEntity?.order_id || order.razorpayOrderId,
				razorpayPaymentId: paymentEntity?.id || order.razorpayPaymentId,
				note: `Payment updated via webhook (${eventType})`
			}, order.userId);
		}

		if (eventType === 'payment.failed' && order.paymentStatus !== 'failed') {
			await markOrderPaymentFailed(order, 'Payment marked failed via webhook', order.userId);
		}

		return res.status(200).json({
			success: true,
			message: 'Webhook processed'
		});
	} catch (error) {
		next(error);
	}
};

const runPendingPaymentsReconciliation = async () => {
	if (!razorpay) {
		return;
	}

	const lookbackHours = Number(process.env.PAYMENT_RECONCILE_LOOKBACK_HOURS || 48);
	const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

	const pendingOrders = await Order.find({
		paymentMethod: { $in: ['card', 'upi'] },
		paymentStatus: { $in: ['pending', 'failed'] },
		orderStatus: { $ne: 'Cancelled' },
		razorpayOrderId: { $ne: '' },
		createdAt: { $gte: since }
	}).limit(50);

	for (const order of pendingOrders) {
		try {
			await reconcileOrderFromGateway(order, order.userId);
		} catch (error) {
			console.error(`Reconciliation failed for order ${order._id}:`, error.message);
		}
	}
};

const startPaymentReconciliationJob = () => {
	if (reconciliationTimer || !razorpay) {
		return;
	}

	const intervalMs = Number(process.env.PAYMENT_RECONCILE_INTERVAL_MS || 5 * 60 * 1000);

	runPendingPaymentsReconciliation().catch((error) => {
		console.error('Initial payment reconciliation failed:', error.message);
	});

	reconciliationTimer = setInterval(() => {
		runPendingPaymentsReconciliation().catch((error) => {
			console.error('Scheduled payment reconciliation failed:', error.message);
		});
	}, intervalMs);
};

const getPaymentStatus = async (req, res, next) => {
	try {
		const order = await Order.findById(req.params.orderId);

		if (!order) {
			return res.status(404).json({
				success: false,
				message: 'Order not found'
			});
		}

		if (!ensureOrderAccess(order, req.user)) {
			return res.status(403).json({
				success: false,
				message: 'Access denied for this order'
			});
		}

		return res.status(200).json({
			success: true,
			data: {
				orderId: order._id,
				orderStatus: order.orderStatus,
				paymentMethod: order.paymentMethod,
				paymentStatus: order.paymentStatus,
				razorpayOrderId: order.razorpayOrderId,
				razorpayPaymentId: order.razorpayPaymentId
			}
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createPaymentOrder,
	verifyPayment,
	getPaymentStatus,
	reconcilePayment,
	razorpayWebhook,
	startPaymentReconciliationJob
};
