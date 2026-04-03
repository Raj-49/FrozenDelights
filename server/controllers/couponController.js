const Coupon = require('../models/Coupon');

const computeCouponDiscount = (coupon, subtotal) => {
  if (coupon.discountType === 'flat') {
    return Math.min(coupon.discountValue, subtotal);
  }

  const percentageDiscount = (subtotal * coupon.discountValue) / 100;
  if (coupon.maxDiscountAmount > 0) {
    return Math.min(percentageDiscount, coupon.maxDiscountAmount);
  }
  return percentageDiscount;
};

const validateCouponForUser = (coupon, subtotal, userId) => {
  const now = new Date();

  if (!coupon || !coupon.active) {
    return { valid: false, message: 'Coupon is inactive' };
  }

  if (coupon.startsAt && now < coupon.startsAt) {
    return { valid: false, message: 'Coupon is not active yet' };
  }

  if (now > coupon.expiresAt) {
    return { valid: false, message: 'Coupon has expired' };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  if (subtotal < coupon.minOrderAmount) {
    return { valid: false, message: `Minimum order amount is ₹${coupon.minOrderAmount}` };
  }

  const usage = coupon.usedBy.find((entry) => String(entry.userId) === String(userId));
  const userUsageCount = usage?.count || 0;
  if (coupon.perUserLimit > 0 && userUsageCount >= coupon.perUserLimit) {
    return { valid: false, message: 'Coupon usage limit reached for your account' };
  }

  const discount = Number(computeCouponDiscount(coupon, subtotal).toFixed(2));
  if (discount <= 0) {
    return { valid: false, message: 'Coupon is not applicable for this order' };
  }

  return {
    valid: true,
    discount,
    finalSubtotal: Number((subtotal - discount).toFixed(2))
  };
};

const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const subtotalNumber = Number(subtotal || 0);
    if (Number.isNaN(subtotalNumber) || subtotalNumber <= 0) {
      return res.status(400).json({ success: false, message: 'Valid subtotal is required' });
    }

    const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim() });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const validation = validateCouponForUser(coupon, subtotalNumber, req.user._id);
    if (!validation.valid) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discount: validation.discount,
        finalSubtotal: validation.finalSubtotal
      }
    });
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      code: String(req.body.code || '').toUpperCase().trim()
    };

    const coupon = await Coupon.create(payload);
    res.status(201).json({ success: true, data: coupon, message: 'Coupon created successfully' });
  } catch (error) {
    next(error);
  }
};

const getCouponsAdmin = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
};

const toggleCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.active = !coupon.active;
    await coupon.save();

    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  computeCouponDiscount,
  validateCouponForUser,
  validateCoupon,
  createCoupon,
  getCouponsAdmin,
  toggleCoupon
};
