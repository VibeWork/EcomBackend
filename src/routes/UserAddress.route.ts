// routes/UserAddress.route.ts
import express from 'express';
import { UserAddressController } from '../controllers/UserAddress.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = express.Router();
const controller = new UserAddressController();

router.get('/my', authenticateJWT, controller.getMyAddresses);
router.post('/add', authenticateJWT, controller.addAddress);
router.delete('/:addressId', authenticateJWT, controller.deleteAddress);
router.put('/:addressId', authenticateJWT, controller.updateAddress);

export default router;
