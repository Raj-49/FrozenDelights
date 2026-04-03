const Order = require('../models/Order');

const getSalesAnalytics = async (req, res, next) => {
	try {
		const days = Number(req.query.days || 7);
		const dateFrom = new Date();
		dateFrom.setDate(dateFrom.getDate() - (days - 1));
		dateFrom.setHours(0, 0, 0, 0);

		const sales = await Order.aggregate([
			{ $match: { createdAt: { $gte: dateFrom } } },
			{
				$group: {
					_id: {
						$dateToString: {
							format: '%Y-%m-%d',
							date: '$createdAt'
						}
					},
					orders: { $sum: 1 },
					revenue: {
						$sum: {
							$cond: [{ $eq: ['$orderStatus', 'Delivered'] }, '$totalAmount', 0]
						}
					}
				}
			},
			{ $sort: { _id: 1 } }
		]);

		res.status(200).json({
			success: true,
			data: sales.map((item) => ({
				date: item._id,
				orders: item.orders,
				revenue: Number((item.revenue || 0).toFixed(2))
			}))
		});
	} catch (error) {
		next(error);
	}
};

const getOrderAnalytics = async (req, res, next) => {
	try {
		const stats = await Order.aggregate([
			{
				$group: {
					_id: '$orderStatus',
					count: { $sum: 1 },
					totalValue: { $sum: '$totalAmount' }
				}
			},
			{ $sort: { count: -1 } }
		]);

		res.status(200).json({
			success: true,
			data: stats.map((item) => ({
				status: item._id,
				count: item.count,
				totalValue: Number((item.totalValue || 0).toFixed(2))
			}))
		});
	} catch (error) {
		next(error);
	}
};

const getProductAnalytics = async (req, res, next) => {
	try {
		const topProducts = await Order.aggregate([
			{ $unwind: '$items' },
			{
				$group: {
					_id: '$items.productId',
					name: { $first: '$items.name' },
					quantitySold: { $sum: '$items.quantity' },
					revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
				}
			},
			{ $sort: { quantitySold: -1 } },
			{ $limit: 10 }
		]);

		res.status(200).json({
			success: true,
			data: topProducts.map((item) => ({
				productId: item._id,
				name: item.name,
				quantitySold: item.quantitySold,
				revenue: Number((item.revenue || 0).toFixed(2))
			}))
		});
	} catch (error) {
		next(error);
	}
};

const getRevenueAnalytics = async (req, res, next) => {
	try {
		const [summary] = await Order.aggregate([
			{
				$group: {
					_id: null,
					totalOrders: { $sum: 1 },
					deliveredOrders: {
						$sum: { $cond: [{ $eq: ['$orderStatus', 'Delivered'] }, 1, 0] }
					},
					cancelledOrders: {
						$sum: { $cond: [{ $eq: ['$orderStatus', 'Cancelled'] }, 1, 0] }
					},
					totalRevenue: {
						$sum: {
							$cond: [{ $eq: ['$orderStatus', 'Delivered'] }, '$totalAmount', 0]
						}
					},
					averageOrderValue: {
						$avg: {
							$cond: [{ $eq: ['$orderStatus', 'Delivered'] }, '$totalAmount', null]
						}
					}
				}
			}
		]);

		res.status(200).json({
			success: true,
			data: {
				totalOrders: summary?.totalOrders || 0,
				deliveredOrders: summary?.deliveredOrders || 0,
				cancelledOrders: summary?.cancelledOrders || 0,
				totalRevenue: Number((summary?.totalRevenue || 0).toFixed(2)),
				averageOrderValue: Number((summary?.averageOrderValue || 0).toFixed(2))
			}
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getSalesAnalytics,
	getOrderAnalytics,
	getProductAnalytics,
	getRevenueAnalytics
};
