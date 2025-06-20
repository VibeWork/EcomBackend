
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Coupon from '../models/Coupon.model';
import UserCoupon from '../models/UserCoupon.model';
import User from '../models/User.model';
import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET_KEY!;

const formatGBP = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);

export class CouponController {
  
  async createCoupon(req: Request, res: Response) {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        discountMaxLimit,
        expiryDate,
        minimumOrderValue,
        applicableCategories,
        usageLimitPerUser,
        usageLimitGlobal,
      } = req.body;

      const existing = await Coupon.findOne({ where: { code } });
      if (existing) {
        return res.status(409).json({ message: 'Coupon code already exists' });
      }

      const newCoupon = await Coupon.create({
        code,
        description,
        discountType,
        discountValue,
        discountMaxLimit,
        expiryDate,
        minimumOrderValue,
        applicableCategories,
        status: 'active',
        usageLimitPerUser,
        usageLimitGlobal,
        usedCount: 0,
      });

      return res.status(201).json({ message: 'Coupon created', coupon: newCoupon });
    } catch (err: any) {
      console.error('❌ Error creating coupon:', err.message);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  }

  async assignCouponToUser(req: Request, res: Response) {
    try {
      const { couponCode, userId } = req.body;

      const coupon = await Coupon.findOne({ where: { code: couponCode } });
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

      const alreadyAssigned = await UserCoupon.findOne({
        where: { userId, couponId: coupon.couponId },
      });

      if (alreadyAssigned) {
        return res.status(409).json({ message: 'Coupon already assigned to user' });
      }

      await UserCoupon.create({
        id: crypto.randomUUID(),
        userId,
        couponId: coupon.couponId,
        issuedAt: new Date(),
        isRedeemed: false,
      });

      return res.status(201).json({ message: 'Coupon assigned to user' });
    } catch (error: any) {
      console.error('❌ Error assigning coupon:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async getAvailableCoupons(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const now = new Date();

      const coupons = await UserCoupon.findAll({
        where: {
          userId,
          isRedeemed: false,
        },
        include: [
          {
            model: Coupon,
            where: {
              expiryDate: { [require('sequelize').Op.gt]: now },
              status: 'active',
            },
          },
        ],
      });

      return res.status(200).json({ coupons });
    } catch (error: any) {
      console.error('❌ Error fetching coupons:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async applyCoupon(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const { couponCode, cartTotal } = req.body;

      const coupon = await Coupon.findOne({ where: { code: couponCode } });
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

      const userCoupon = await UserCoupon.findOne({
        where: {
          userId,
          couponId: coupon.couponId,
          isRedeemed: false,
        },
      });

      if (!userCoupon) {
        return res.status(404).json({ message: 'Coupon not available or already redeemed' });
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ message: 'Coupon expired' });
      }

      if (cartTotal < coupon.minimumOrderValue) {
        return res.status(400).json({
           message: `Minimum order value is ${formatGBP(coupon.minimumOrderValue)}`,
        });
      }

      let discount = 0;
      if (coupon.discountType === 'flat') {
        discount = coupon.discountValue;
      } else if (coupon.discountType === 'percentage') {
        discount = (coupon.discountValue / 100) * cartTotal;
        discount = Math.min(discount, coupon.discountMaxLimit);
      }

      return res.status(200).json({
        message: 'Coupon applied successfully',
        discountAmount: parseFloat(discount.toFixed(2)),
         formattedDiscount: formatGBP(discount),
      });
    } catch (error: any) {
      console.error('❌ Error applying coupon:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async redeemCoupon(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const { couponCode } = req.body;

      const coupon = await Coupon.findOne({ where: { code: couponCode } });
      if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

      const userCoupon = await UserCoupon.findOne({
        where: {
          userId,
          couponId: coupon.couponId,
          isRedeemed: false,
        },
      });

      if (!userCoupon) {
        return res.status(404).json({ message: 'Coupon already redeemed or not assigned' });
      }

      userCoupon.isRedeemed = true;
      userCoupon.redeemedAt = new Date();
      await userCoupon.save();

      await Coupon.increment('usedCount', { where: { couponId: coupon.couponId } });

      return res.status(200).json({ message: 'Coupon redeemed successfully' });
    } catch (error: any) {
      console.error('❌ Error redeeming coupon:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async assignCouponToAllUsers(req: Request, res: Response) {
  try {
    const { couponCode } = req.body;

    const coupon = await Coupon.findOne({ where: { code: couponCode } });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const users = await User.findAll();

    const assignedUsers = await UserCoupon.findAll({
      where: { couponId: coupon.couponId },
    });

    const alreadyAssignedUserIds = new Set(assignedUsers.map((uc) => uc.userId));

    const newAssignments = users
      .filter((user) => !alreadyAssignedUserIds.has(user.userId))
      .map((user) => ({
        id: crypto.randomUUID(),
        userId: user.userId,
        couponId: coupon.couponId,
        issuedAt: new Date(),
        isRedeemed: false,
      }));

    if (newAssignments.length > 0) {
      await UserCoupon.bulkCreate(newAssignments);
    }

    return res.status(201).json({
      message: `Coupon assigned to ${newAssignments.length} user(s) successfully.`,
    });
  } catch (error: any) {
    console.error('❌ Error assigning coupon to all users:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

}
