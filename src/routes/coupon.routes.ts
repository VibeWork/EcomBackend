import express from 'express';
import { CouponController } from '../controllers/Coupon.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();
const controller = new CouponController();

// ✅ Admin assigns coupon to a user
router.post('/assign', authenticateJWT, controller.assignCouponToUser);

// ✅ Get all active and unredeemed coupons for the current user
router.get('/available', authenticateJWT, controller.getAvailableCoupons);

// ✅ Apply a coupon for checking discount
router.post('/apply', authenticateJWT, controller.applyCoupon);

// ✅ Redeem a coupon after successful order placement
router.post('/redeem', authenticateJWT, controller.redeemCoupon);

// Admin creates a new coupon
router.post('/create', authenticateJWT, controller.createCoupon);

// ✅ Admin assigns coupon to all users
router.post('/assign-all', authenticateJWT, controller.assignCouponToAllUsers);



export default router;
