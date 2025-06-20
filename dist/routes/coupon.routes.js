"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Coupon_controller_1 = require("../controllers/Coupon.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const controller = new Coupon_controller_1.CouponController();
// ✅ Admin assigns coupon to a user
router.post('/assign', auth_middleware_1.authenticateJWT, controller.assignCouponToUser);
// ✅ Get all active and unredeemed coupons for the current user
router.get('/available', auth_middleware_1.authenticateJWT, controller.getAvailableCoupons);
// ✅ Apply a coupon for checking discount
router.post('/apply', auth_middleware_1.authenticateJWT, controller.applyCoupon);
// ✅ Redeem a coupon after successful order placement
router.post('/redeem', auth_middleware_1.authenticateJWT, controller.redeemCoupon);
// Admin creates a new coupon
router.post('/create', auth_middleware_1.authenticateJWT, controller.createCoupon);
// ✅ Admin assigns coupon to all users
router.post('/assign-all', auth_middleware_1.authenticateJWT, controller.assignCouponToAllUsers);
exports.default = router;
