import express from 'express';
import { CartController } from '../controllers/Cart.controller';
import {authenticateJWT} from "../middlewares/auth.middleware";


const router = express.Router();
const cartController = new CartController();

router.post('/add',authenticateJWT, cartController.addToCart);
router.get('/', authenticateJWT,cartController.getCart);
router.put('/update', authenticateJWT,cartController.updateCartItem);
router.delete('/remove/:productId',authenticateJWT, cartController.removeCartItem);

export default router;
