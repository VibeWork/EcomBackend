"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_controller_1 = require("../controllers/Cart.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const cartController = new Cart_controller_1.CartController();
router.post('/add', auth_middleware_1.authenticateJWT, cartController.addToCart);
router.get('/', auth_middleware_1.authenticateJWT, cartController.getCart);
router.put('/update', auth_middleware_1.authenticateJWT, cartController.updateCartItem);
router.delete('/remove/:productId', auth_middleware_1.authenticateJWT, cartController.removeCartItem);
exports.default = router;
