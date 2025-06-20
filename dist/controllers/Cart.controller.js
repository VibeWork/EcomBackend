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
exports.CartController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Cart_Model_1 = __importDefault(require("../models/Cart.Model"));
const Product_Model_1 = __importDefault(require("../models/Product.Model"));
const SECRET_KEY = process.env.JWT_SECRET_KEY;
class CartController {
    // ✅ Add to cart
    addToCart(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, quantity } = req.body;
                if (!productId || quantity <= 0) {
                    return res.status(400).json({ message: 'Product ID and valid quantity are required' });
                }
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const product = yield Product_Model_1.default.findByPk(productId);
                if (!product || product.stock < quantity) {
                    return res.status(400).json({ message: 'Insufficient stock or product unavailable' });
                }
                const existingItem = yield Cart_Model_1.default.findOne({ where: { userId, productId } });
                if (existingItem) {
                    const newQuantity = existingItem.quantity + quantity;
                    if (newQuantity > product.stock) {
                        return res.status(400).json({ message: 'Requested quantity exceeds stock' });
                    }
                    existingItem.quantity = newQuantity;
                    yield existingItem.save();
                }
                else {
                    yield Cart_Model_1.default.create({ userId, productId, quantity });
                }
                return res.status(200).json({ message: 'Product added to cart' });
            }
            catch (error) {
                console.error('❌ Add to cart error:', error.message);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
    // ✅ Get cart
    getCart(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const cartItems = yield Cart_Model_1.default.findAll({
                    where: { userId },
                    include: [Product_Model_1.default],
                });
                const cartWithStockInfo = cartItems.map((item) => {
                    const product = item.product;
                    const outOfStock = !product || product.stock < item.quantity;
                    return {
                        id: item.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        outOfStock,
                        product: product ? Object.assign({ productName: product.productName, finalPrice: product.finalPrice, stock: product.stock, productImages: product.productImages }, product.toJSON()) : null,
                    };
                });
                return res.status(200).json({ cart: cartWithStockInfo });
            }
            catch (error) {
                console.error('❌ Get cart error:', error.message);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
    // ✅ Remove item
    removeCartItem(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const { productId } = req.params;
                yield Cart_Model_1.default.destroy({ where: { userId, productId } });
                return res.status(200).json({ message: 'Item removed from cart' });
            }
            catch (error) {
                console.error('❌ Remove cart item error:', error.message);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
    // ✅ Update quantity
    updateCartItem(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, quantity } = req.body;
                if (!productId || quantity <= 0) {
                    return res.status(400).json({ message: 'Product ID and valid quantity required' });
                }
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                const userId = decoded.userId;
                const product = yield Product_Model_1.default.findByPk(productId);
                if (!product || product.stock < quantity) {
                    return res.status(400).json({ message: 'Insufficient stock' });
                }
                const cartItem = yield Cart_Model_1.default.findOne({ where: { userId, productId } });
                if (!cartItem) {
                    return res.status(404).json({ message: 'Item not found in cart' });
                }
                cartItem.quantity = quantity;
                yield cartItem.save();
                return res.status(200).json({ message: 'Cart updated', cartItem });
            }
            catch (error) {
                console.error('❌ Update cart error:', error.message);
                return res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
    }
}
exports.CartController = CartController;
