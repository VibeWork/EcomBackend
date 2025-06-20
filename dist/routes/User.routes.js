"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/User.route.ts
const express_1 = __importDefault(require("express"));
const User_controller_1 = require("../controllers/User.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const userController = new User_controller_1.UserController();
router.get('/me', auth_middleware_1.authenticateJWT, userController.getMe);
router.put('/update', auth_middleware_1.authenticateJWT, userController.updateProfile);
router.get('/admin/all', auth_middleware_1.authenticateJWT, userController.getAllUsers);
router.put('/admin/promote/:userId', auth_middleware_1.authenticateJWT, userController.promoteToAdmin);
router.get('/admin/customers/stats', auth_middleware_1.authenticateJWT, userController.getCustomerStats);
router.get('/admin/customers/filter', auth_middleware_1.authenticateJWT, userController.getCustomersByDate);
exports.default = router;
