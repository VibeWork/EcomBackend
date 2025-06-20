import express from 'express';
import { OrderController } from '../controllers/Order.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import bodyParser from 'body-parser';

const router = express.Router();
const orderController = new OrderController();

// 📦 Place a new order
router.post('/place', authenticateJWT, orderController.placeOrder);

// 📄 Get all orders for the logged-in user
router.get('/user', authenticateJWT, orderController.getUserOrders);

// 🔍 Get a specific order by orderId for that user
router.get('/user/:orderId', authenticateJWT, orderController.getOrderById);

// 👑 (Admin-only) Get all orders
router.get('/admin/all', authenticateJWT, orderController.getAllOrders);

router.post('/create-payment-intent', authenticateJWT, orderController.createStripePaymentIntent);


router.post('/confirm', authenticateJWT, orderController.confirmStripeOrder);
   
  

//  Cancel an order by orderId
router.patch('/cancel/:orderId', authenticateJWT, orderController.cancelOrder);


// 📄 Get orders with a specific refund status
router.get('/refunds', authenticateJWT, orderController.getRefundOrders);

// Admin approves refund after 3 business days
router.patch('/admin/approve-refund/:orderId', authenticateJWT, orderController.approveRefund);


router.get('/admin/analytics/filter', authenticateJWT,orderController.getFilteredAnalytics
);


router.get('/admin/analytics/recent-orders', authenticateJWT,  orderController.getRecentOrders);
router.get('/admin/analytics/top-products', authenticateJWT,  orderController.getTopSellingProducts);

router.patch(
  '/admin/update-status/:orderId',
  authenticateJWT,
 
  orderController.updateOrderStatus
);


// Admin marks COD order as paid and delivered
router.patch(
  '/admin/mark-cod-received/:orderId',
  authenticateJWT,
  orderController.markCodPaymentReceived
);

// Admin: Get orders by payment method and status
router.get('/admin/payment-methods', authenticateJWT, orderController.getFilteredPaymentOrders);


// ✅ Stripe Webhook Route (must use raw body parser)
router.post(
  '/webhook/stripe',
  bodyParser.raw({ type: 'application/json' }),
  orderController.handleStripeWebhook
);

export default router;
  