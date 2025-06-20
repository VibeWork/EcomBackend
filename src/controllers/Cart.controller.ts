import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CartItem from '../models/Cart.Model';
import Product from "../models/Product.Model"

const SECRET_KEY = process.env.JWT_SECRET_KEY!;

export class CartController {
  // ✅ Add to cart
  async addToCart(req: Request, res: Response) {
    try {
      const { productId, quantity } = req.body;
      if (!productId || quantity <= 0) {
        return res.status(400).json({ message: 'Product ID and valid quantity are required' });
      }

      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const product = await Product.findByPk(productId);
      if (!product || product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock or product unavailable' });
      }

      const existingItem = await CartItem.findOne({ where: { userId, productId } });

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          return res.status(400).json({ message: 'Requested quantity exceeds stock' });
        }
        existingItem.quantity = newQuantity;
        await existingItem.save();
      } else {
        await CartItem.create({ userId, productId, quantity });
      }

      return res.status(200).json({ message: 'Product added to cart' });
    } catch (error: any) {
      console.error('❌ Add to cart error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // ✅ Get cart
  async getCart(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const cartItems = await CartItem.findAll({
        where: { userId },
        include: [Product],
      });

      const cartWithStockInfo = cartItems.map((item) => {
        const product = item.product;
        const outOfStock = !product || product.stock < item.quantity;
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          outOfStock,
          product: product ? {
            productName: product.productName,
            finalPrice: product.finalPrice,
            stock: product.stock,
            productImages: product.productImages,
            ...product.toJSON()
          } : null,
        };
      });

      return res.status(200).json({ cart: cartWithStockInfo });
    } catch (error: any) {
      console.error('❌ Get cart error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // ✅ Remove item
  async removeCartItem(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const { productId } = req.params;
      await CartItem.destroy({ where: { userId, productId } });

      return res.status(200).json({ message: 'Item removed from cart' });
    } catch (error: any) {
      console.error('❌ Remove cart item error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  // ✅ Update quantity
  async updateCartItem(req: Request, res: Response) {
    try {
      const { productId, quantity } = req.body;
      if (!productId || quantity <= 0) {
        return res.status(400).json({ message: 'Product ID and valid quantity required' });
      }

      const token = req.headers.authorization?.split(' ')[1];
      const decoded: any = jwt.verify(token!, SECRET_KEY);
      const userId = decoded.userId;

      const product = await Product.findByPk(productId);
      if (!product || product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      const cartItem = await CartItem.findOne({ where: { userId, productId } });
      if (!cartItem) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      cartItem.quantity = quantity;
      await cartItem.save();

      return res.status(200).json({ message: 'Cart updated', cartItem });
    } catch (error: any) {
      console.error('❌ Update cart error:', error.message);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}
