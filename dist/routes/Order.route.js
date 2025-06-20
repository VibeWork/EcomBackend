"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Order_controller_1 = require("../controllers/Order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const body_parser_1 = __importDefault(require("body-parser"));
const router = express_1.default.Router();
const orderController = new Order_controller_1.OrderController();
// 📦 Place a new order
router.post('/place', auth_middleware_1.authenticateJWT, orderController.placeOrder);
// 📄 Get all orders for the logged-in user
router.get('/user', auth_middleware_1.authenticateJWT, orderController.getUserOrders);
// 🔍 Get a specific order by orderId for that user
router.get('/user/:orderId', auth_middleware_1.authenticateJWT, orderController.getOrderById);
// 👑 (Admin-only) Get all orders
router.get('/admin/all', auth_middleware_1.authenticateJWT, orderController.getAllOrders);
router.post('/create-payment-intent', auth_middleware_1.authenticateJWT, orderController.createStripePaymentIntent);
router.post('/confirm', auth_middleware_1.authenticateJWT, orderController.confirmStripeOrder);
//  Cancel an order by orderId
router.patch('/cancel/:orderId', auth_middleware_1.authenticateJWT, orderController.cancelOrder);
// 📄 Get orders with a specific refund status
router.get('/refunds', auth_middleware_1.authenticateJWT, orderController.getRefundOrders);
// Admin approves refund after 3 business days
router.patch('/admin/approve-refund/:orderId', auth_middleware_1.authenticateJWT, orderController.approveRefund);
router.get('/admin/analytics/filter', auth_middleware_1.authenticateJWT, orderController.getFilteredAnalytics);
router.get('/admin/analytics/recent-orders', auth_middleware_1.authenticateJWT, orderController.getRecentOrders);
router.get('/admin/analytics/top-products', auth_middleware_1.authenticateJWT, orderController.getTopSellingProducts);
router.patch('/admin/update-status/:orderId', auth_middleware_1.authenticateJWT, orderController.updateOrderStatus);
// Admin marks COD order as paid and delivered
router.patch('/admin/mark-cod-received/:orderId', auth_middleware_1.authenticateJWT, orderController.markCodPaymentReceived);
// Admin: Get orders by payment method and status
router.get('/admin/payment-methods', auth_middleware_1.authenticateJWT, orderController.getFilteredPaymentOrders);
// ✅ Stripe Webhook Route (must use raw body parser)
router.post('/webhook/stripe', body_parser_1.default.raw({ type: 'application/json' }), orderController.handleStripeWebhook);
exports.default = router;
