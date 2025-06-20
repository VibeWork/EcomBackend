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
exports.UserController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const UserAddress_model_1 = __importDefault(require("../models/UserAddress.model"));
const sequelize_1 = require("sequelize");
const SECRET_KEY = process.env.JWT_SECRET_KEY;
class UserController {
    // ✅ Get current user's profile
    // ✅ Get current user's profile with addresses
    getMe(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const user = yield User_model_1.default.findByPk(decoded.userId, {
                    include: [UserAddress_model_1.default], // 👈 Include address list
                });
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                return res.status(200).json({ user });
            }
            catch (error) {
                console.error('❌ Error getting user:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    // ✅ Update user's profile
    updateProfile(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const user = yield User_model_1.default.findByPk(decoded.userId);
                if (!user)
                    return res.status(404).json({ message: 'User not found' });
                const { name, phone, profile, profilePicture, } = req.body;
                user.name = name !== null && name !== void 0 ? name : user.name;
                user.phone = phone !== null && phone !== void 0 ? phone : user.phone;
                user.profile = profile !== null && profile !== void 0 ? profile : user.profile;
                user.profilePicture = profilePicture !== null && profilePicture !== void 0 ? profilePicture : user.profilePicture;
                yield user.save();
                return res.status(200).json({ message: '✅ Profile updated', user });
            }
            catch (error) {
                console.error('❌ Error updating profile:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    // ✅ (Admin) Get all users
    getAllUsers(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const requester = yield User_model_1.default.findByPk(decoded.userId);
                if (!requester || requester.role !== 'admin') {
                    return res.status(403).json({ message: 'Access denied. Admins only.' });
                }
                const users = yield User_model_1.default.findAll();
                return res.status(200).json({ users });
            }
            catch (error) {
                console.error('❌ Error fetching users:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    // ✅ (Admin) Promote user to admin
    promoteToAdmin(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const requester = yield User_model_1.default.findByPk(decoded.userId);
                if (!requester || requester.role !== 'admin') {
                    return res.status(403).json({ message: 'Access denied. Admins only.' });
                }
                const { userId } = req.params;
                const targetUser = yield User_model_1.default.findByPk(userId);
                if (!targetUser)
                    return res.status(404).json({ message: 'User not found' });
                targetUser.role = 'admin';
                yield targetUser.save();
                return res.status(200).json({ message: '✅ User promoted to admin', user: targetUser });
            }
            catch (error) {
                console.error('❌ Error promoting user:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    getCustomerStats(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const adminUser = yield User_model_1.default.findByPk(decoded.userId);
                // if (!adminUser || adminUser.role !== 'admin') {
                //   return res.status(403).json({ message: 'Access denied. Admins only.' });
                // }
                const today = new Date();
                const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                // Total customers
                const totalCustomers = yield User_model_1.default.count({ where: { role: 'user' } });
                // Customers registered this month
                const monthlyCustomers = yield User_model_1.default.count({
                    where: {
                        role: 'user',
                        createdAt: {
                            [sequelize_1.Op.gte]: firstDayOfMonth,
                            [sequelize_1.Op.lte]: today,
                        }
                    }
                });
                return res.status(200).json({
                    totalCustomers,
                    monthlyCustomers,
                });
            }
            catch (error) {
                console.error('❌ Error getting customer stats:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
    getCustomersByDate(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                // const adminUser = await User.findByPk(decoded.userId);
                // if (!adminUser || adminUser.role !== 'admin') {
                //   return res.status(403).json({ message: 'Access denied. Admins only.' });
                // }
                const { startDate, endDate } = req.query;
                const start = startDate ? new Date(startDate) : new Date('2000-01-01');
                const end = endDate ? new Date(endDate) : new Date();
                const whereCondition = {
                    role: 'user',
                    createdAt: {
                        [sequelize_1.Op.gte]: start,
                        [sequelize_1.Op.lte]: end,
                    },
                };
                // Fetch users
                const users = yield User_model_1.default.findAll({
                    where: whereCondition,
                    order: [['createdAt', 'DESC']],
                });
                // Count total
                const totalCount = yield User_model_1.default.count({ where: whereCondition });
                return res.status(200).json({
                    totalUsers: totalCount,
                    users,
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                });
            }
            catch (error) {
                console.error('❌ Error getting users by date:', error.message);
                return res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        });
    }
}
exports.UserController = UserController;
