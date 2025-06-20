// routes/User.route.ts
import express from 'express';
import { UserController } from '../controllers/User.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();
const userController = new UserController();

router.get('/me', authenticateJWT, userController.getMe);
router.put('/update', authenticateJWT, userController.updateProfile);
router.get('/admin/all', authenticateJWT, userController.getAllUsers);
router.put('/admin/promote/:userId', authenticateJWT, userController.promoteToAdmin);
router.get('/admin/customers/stats', authenticateJWT,userController.getCustomerStats);
router.get('/admin/customers/filter', authenticateJWT, userController.getCustomersByDate);

export default router;
