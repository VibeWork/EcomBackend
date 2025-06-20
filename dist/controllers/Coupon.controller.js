"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const UserCoupon_model_1 = __importDefault(require("../models/UserCoupon.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const crypto_1 = __importDefault(require("crypto"));
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const formatGBP = (amount) => new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
}).format(amount);
class CouponController {
    createCoupon(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, description, discountType, discountValue, discountMaxLimit, expiryDate, minimumOrderValue, applicableCategories, usageLimitPerUser, usageLimitGlobal, } = req.body;
                const existing = yield Coupon_model_1.default.findOne({ where: { code } });
                if (existing) {
                    return res.status(409).json({ message: 'Coupon code already exists' });
                }
                const newCoupon = yield Coupon_model_1.default.create({
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
            }
            catch (err) {
                console.error('❌ Error creating coupon:', err.message);
                return res.status(500).json({ message: 'Internal server error', error: err.message });
            }
        });
    }
    assignCouponToUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { couponCode, userId } = req.body;
                const coupon = yield Coupon_model_1.default.findOne({ where: { code: couponCode } });
                if (!coupon)
                    return res.status(404).json({ message: 'Coupon not found' });
                const alreadyAssigned = yield UserCoupon_model_1.default.findOne({
                    where: { userId, couponId: coupon.couponId },
                });
                if (alreadyAssigned) {
                    return res.status(409).json({ message: 'Coupon already assigned to user' });
                }
                yield UserCoupon_model_1.default.create({
                    id: crypto_1.default.randomUUID(),
                    userId,
                    couponId: coupon.couponId,
                    issuedAt: new Date(),
                    isRedeemed: false,
                });
                return res.status(201).json({ message: 'Coupon assigned to user' });
            }
            catch (error) {
                console.error('❌ Error assigning coupon:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    getAvailableCoupons(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const now = new Date();
                const coupons = yield UserCoupon_model_1.default.findAll({
                    where: {
                        userId,
                        isRedeemed: false,
                    },
                    include: [
                        {
                            model: Coupon_model_1.default,
                            where: {
                                expiryDate: { [require('sequelize').Op.gt]: now },
                                status: 'active',
                            },
                        },
                    ],
                });
                return res.status(200).json({ coupons });
            }
            catch (error) {
                console.error('❌ Error fetching coupons:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    applyCoupon(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const { couponCode, cartTotal } = req.body;
                const coupon = yield Coupon_model_1.default.findOne({ where: { code: couponCode } });
                if (!coupon)
                    return res.status(404).json({ message: 'Coupon not found' });
                const userCoupon = yield UserCoupon_model_1.default.findOne({
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
                }
                else if (coupon.discountType === 'percentage') {
                    discount = (coupon.discountValue / 100) * cartTotal;
                    discount = Math.min(discount, coupon.discountMaxLimit);
                }
                return res.status(200).json({
                    message: 'Coupon applied successfully',
                    discountAmount: parseFloat(discount.toFixed(2)),
                    formattedDiscount: formatGBP(discount),
                });
            }
            catch (error) {
                console.error('❌ Error applying coupon:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    redeemCoupon(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const { couponCode } = req.body;
                const coupon = yield Coupon_model_1.default.findOne({ where: { code: couponCode } });
                if (!coupon)
                    return res.status(404).json({ message: 'Coupon not found' });
                const userCoupon = yield UserCoupon_model_1.default.findOne({
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
                yield userCoupon.save();
                yield Coupon_model_1.default.increment('usedCount', { where: { couponId: coupon.couponId } });
                return res.status(200).json({ message: 'Coupon redeemed successfully' });
            }
            catch (error) {
                console.error('❌ Error redeeming coupon:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    assignCouponToAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { couponCode } = req.body;
                const coupon = yield Coupon_model_1.default.findOne({ where: { code: couponCode } });
                if (!coupon)
                    return res.status(404).json({ message: 'Coupon not found' });
                const users = yield User_model_1.default.findAll();
                const assignedUsers = yield UserCoupon_model_1.default.findAll({
                    where: { couponId: coupon.couponId },
                });
                const alreadyAssignedUserIds = new Set(assignedUsers.map((uc) => uc.userId));
                const newAssignments = users
                    .filter((user) => !alreadyAssignedUserIds.has(user.userId))
                    .map((user) => ({
                    id: crypto_1.default.randomUUID(),
                    userId: user.userId,
                    couponId: coupon.couponId,
                    issuedAt: new Date(),
                    isRedeemed: false,
                }));
                if (newAssignments.length > 0) {
                    yield UserCoupon_model_1.default.bulkCreate(newAssignments);
                }
                return res.status(201).json({
                    message: `Coupon assigned to ${newAssignments.length} user(s) successfully.`,
                });
            }
            catch (error) {
                console.error('❌ Error assigning coupon to all users:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
}
exports.CouponController = CouponController;
