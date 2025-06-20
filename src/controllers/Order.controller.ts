
//Controller/order.controller.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CartItem from '../models/Cart.Model';
import Product from '../models/Product.Model';
import Order from '../models/Order.model';
import OrderItem from '../models/OrderItem.model';
import Coupon from '../models/Coupon.model';
import UserCoupon from '../models/UserCoupon.model';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import User from '../models/User.model';
import stripe from '../config/stripe.config'; 
import UserAddress from '../models/UserAddress.model';
import { sequelize } from "../config/Database.config"



const SECRET_KEY = process.env.JWT_SECRET_KEY!;
type OrderItemInput = {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
};
export class OrderController {



// async placeOrder(req: Request, res: Response) {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     const decoded: any = jwt.verify(token!, SECRET_KEY);
//     const userId = decoded.userId;

//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [Product],
//     });

//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     let totalAmount = 0;
//     const orderItems: OrderItemInput[] = [];

//     for (const cartItem of cartItems) {
//       const product = cartItem.product;

//       if (!product || product.stock < cartItem.quantity) {
//         return res.status(400).json({
//           message: `Insufficient stock for ${product?.productName || 'a product'}`,
//         });
//       }

//       const itemTotal = cartItem.quantity * product.finalPrice;
//       totalAmount += itemTotal;

//       orderItems.push({
//         id: uuidv4(),
//         productId: product.id,
//         productName: product.productName,
//         productImage: product.productImages?.[0] || '',
//         unitPrice: product.finalPrice,
//         quantity: cartItem.quantity,
//         totalPrice: itemTotal,
//       });
//     }

//     const {
//       addressId,
//       deliveryType,
//       paymentMethod,
//       couponCode = '',
//       scheduledTime,
//       userInstructions = '',
//     } = req.body;

//     if (paymentMethod !== 'Cash') {
//       return res.status(400).json({
//         message: 'Only Cash on Delivery is allowed for this route.',
//       });
//     }

//     // ✅ Get full address string
//     const userAddress = await UserAddress.findOne({ where: { addressId, userId } });
//     if (!userAddress) {
//       return res.status(400).json({ message: 'Invalid delivery address selected' });
//     }

//     const deliveryAddress = `${userAddress.addressLine}, ${userAddress.landmark}, ${userAddress.city}, ${userAddress.state}, ${userAddress.pincode}, ${userAddress.country}`;

//     // ✅ Apply coupon
//     let discountAmount = 0;
//     if (couponCode) {
//       const coupon = await Coupon.findOne({
//         where: {
//           code: couponCode,
//           expiryDate: { [Op.gt]: new Date() },
//           status: 'active',
//         },
//       });

//       if (!coupon) {
//         return res.status(400).json({ message: 'Invalid or expired coupon' });
//       }

//       const userCoupon = await UserCoupon.findOne({
//         where: {
//           userId,
//           couponId: coupon.couponId,
//           isRedeemed: false,
//         },
//       });

//       if (!userCoupon) {
//         return res.status(400).json({ message: 'Coupon not assigned or already used' });
//       }

//       if (totalAmount < coupon.minimumOrderValue) {
//         return res.status(400).json({
//           message: `Minimum order value should be ₹${coupon.minimumOrderValue}`,
//         });
//       }

//       discountAmount =
//         coupon.discountType === 'flat'
//           ? coupon.discountValue
//           : Math.min((coupon.discountValue / 100) * totalAmount, coupon.discountMaxLimit);

//       await Coupon.increment('usedCount', { where: { couponId: coupon.couponId } });
//       await UserCoupon.update(
//         { isRedeemed: true, redeemedAt: new Date() },
//         { where: { userId, couponId: coupon.couponId, isRedeemed: false } }
//       );
//     }

//     const finalAmount = totalAmount - discountAmount;

//     const order = await Order.create({
//       orderId: uuidv4(),
//       userId,
//       totalAmount: finalAmount,
//       discountAmount,
//       couponCode,
//       isPaid: false,
//       paidAmount: 0,
//       paymentStatus: 'Pending',
//       transactionId: '',
//       paymentMethod: 'Cash',
//       orderStatus: 'Pending',
//       deliveryType,
//       deliveryPartner: '',
//       trackingNumber: '',
//       deliveryAddress,
//       scheduledTime,
//       orderNotes: '',
//       userInstructions,
//     });

//     for (const item of orderItems) {
//       await OrderItem.create({ ...item, orderId: order.orderId });

//       const product = await Product.findByPk(item.productId);
//       if (product) {
//         product.stock -= item.quantity;
//         await product.save();
//       }
//     }

//     await CartItem.destroy({ where: { userId } });

//     return res.status(201).json({
//       message: '✅ COD Order placed successfully',
//       orderId: order.orderId,
//       total: finalAmount,
//       paymentStatus: 'Pending',
//     });
//   } catch (error: any) {
//     console.error('❌ Error placing COD order:', error.message);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// }

//Place Order with transaction and roll back
async placeOrder(req: Request, res: Response) {
  const t = await sequelize.transaction();

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [Product],
      transaction: t
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems: OrderItemInput[] = [];

    for (const cartItem of cartItems) {
      // Lock the product row for update
      const product = await Product.findByPk(cartItem.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product || product.stock < cartItem.quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${product?.productName || 'a product'}`,
        });
      }

      const itemTotal = cartItem.quantity * product.finalPrice;
      totalAmount += itemTotal;

      orderItems.push({
        id: uuidv4(),
        productId: product.id,
        productName: product.productName,
        productImage: product.productImages?.[0] || '',
        unitPrice: product.finalPrice,
        quantity: cartItem.quantity,
        totalPrice: itemTotal,
      });

      product.stock -= cartItem.quantity;
      await product.save({ transaction: t });
    }

    const {
      addressId,
      deliveryType,
      paymentMethod,
      couponCode = '',
      scheduledTime,
      userInstructions = '',
    } = req.body;

    if (paymentMethod !== 'Cash') {
      await t.rollback();
      return res.status(400).json({
        message: 'Only Cash on Delivery is allowed for this route.',
      });
    }

    const userAddress = await UserAddress.findOne({ where: { addressId, userId }, transaction: t });
    if (!userAddress) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid delivery address selected' });
    }

    const deliveryAddress = `${userAddress.addressLine}, ${userAddress.landmark}, ${userAddress.city}, ${userAddress.state}, ${userAddress.pincode}, ${userAddress.country}`;

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          expiryDate: { [Op.gt]: new Date() },
          status: 'active',
        },
        transaction: t,
      });

      if (!coupon) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }

      const userCoupon = await UserCoupon.findOne({
        where: {
          userId,
          couponId: coupon.couponId,
          isRedeemed: false,
        },
        transaction: t,
      });

      if (!userCoupon) {
        await t.rollback();
        return res.status(400).json({ message: 'Coupon not assigned or already used' });
      }

      if (totalAmount < coupon.minimumOrderValue) {
        await t.rollback();
        return res.status(400).json({
          message: `Minimum order value should be ₹${coupon.minimumOrderValue}`,
        });
      }

      discountAmount =
        coupon.discountType === 'flat'
          ? coupon.discountValue
          : Math.min((coupon.discountValue / 100) * totalAmount, coupon.discountMaxLimit);

      await Coupon.increment('usedCount', { where: { couponId: coupon.couponId }, transaction: t });

      await UserCoupon.update(
        { isRedeemed: true, redeemedAt: new Date() },
        {
          where: { userId, couponId: coupon.couponId, isRedeemed: false },
          transaction: t,
        }
      );
    }

    const finalAmount = totalAmount - discountAmount;

    const order = await Order.create({
      orderId: uuidv4(),
      userId,
      totalAmount: finalAmount,
      discountAmount,
      couponCode,
      isPaid: false,
      paidAmount: 0,
      paymentStatus: 'Pending',
      transactionId: '',
      paymentMethod: 'Cash',
      orderStatus: 'Pending',
      deliveryType,
      deliveryPartner: '',
      trackingNumber: '',
      deliveryAddress,
      scheduledTime,
      orderNotes: '',
      userInstructions,
    }, { transaction: t });

    for (const item of orderItems) {
      await OrderItem.create({ ...item, orderId: order.orderId }, { transaction: t });
    }

    await CartItem.destroy({ where: { userId }, transaction: t });

    await t.commit();

    return res.status(201).json({
      message: '✅ COD Order placed successfully',
      orderId: order.orderId,
      total: finalAmount,
      paymentStatus: 'Pending',
    });
  } catch (error: any) {
    await t.rollback();
    console.error('❌ Error placing COD order:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


async getUserOrders(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;

    const orders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ orders });
  } catch (error: any) {
    console.error("❌ Error fetching user orders:", error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


async getOrderById(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;

    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { userId, orderId },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (error: any) {
    console.error("❌ Error fetching order:", error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


async getAllOrders(req: Request, res: Response) {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: 'items'
        },
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'name', 'email', 'phone']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({ orders });
  } catch (error: any) {
    console.error("❌ Error fetching all orders:", error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// Inside OrderController

async createStripePaymentIntent(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [Product],
    });

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;

    for (const item of cartItems) {
      const product = item.product;

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product?.productName || 'a product'}`,
        });
      }

      totalAmount += item.quantity * product.finalPrice;
    }

    // const { couponCode = '' } = req.body;

    //added address id also 
    const { couponCode = '', addressId } = req.body;

if (addressId) {
  const address = await UserAddress.findOne({ where: { userId, addressId } });
  if (!address) {
    return res.status(400).json({ message: 'Invalid address selected' });
  }
}
    let discountAmount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          expiryDate: { [Op.gt]: new Date() },
          status: 'active',
        },
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }

      if (totalAmount < coupon.minimumOrderValue) {
        return res.status(400).json({
          message: `Minimum order value should be ₹${coupon.minimumOrderValue}`,
        });
      }

      if (coupon.discountType === 'flat') {
        discountAmount = coupon.discountValue;
      } else if (coupon.discountType === 'percentage') {
        discountAmount = (coupon.discountValue / 100) * totalAmount;
        discountAmount = Math.min(discountAmount, coupon.discountMaxLimit);
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // Stripe needs amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100),
      currency: 'gbp',
      metadata: { userId },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: finalAmount,
      paymentIntentId: paymentIntent.id,
      discountAmount,
    });
  } catch (error: any) {
    console.error('❌ Error creating payment intent:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}



async handleStripeWebhook(req: Request, res: Response) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = req.headers['stripe-signature'] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle different event types
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;

    const transactionId = paymentIntent.id;
    const amount = paymentIntent.amount_received / 100;

    console.log(`✅ Payment succeeded for: ${transactionId}`);

    // Update order if found
    const order = await Order.findOne({ where: { transactionId } });

    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAmount = amount;
      order.paymentStatus = 'Paid';
      await order.save();

      console.log(`📝 Order ${order.orderId} marked as paid via webhook`);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as any;
    const transactionId = paymentIntent.id;

    console.warn(`⚠️ Payment failed for: ${transactionId}`);
    // Optional: Update order/payment status if you want
  }

  res.status(200).json({ received: true });
}





// async confirmStripeOrder(req: Request, res: Response) {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     const decoded: any = jwt.verify(token!, SECRET_KEY);
//     const userId = decoded.userId;

//     const {
//       paymentIntentId,
//       addressId,
//       deliveryType,
//       couponCode = '',
//       scheduledTime,
//       userInstructions = ''
//     } = req.body;

//     //  Step 1: Retrieve payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (!paymentIntent || paymentIntent.status !== 'succeeded') {
//       return res.status(400).json({ message: 'Payment not successful' });
//     }

//     const transactionId = paymentIntent.id;
//     const paidAmount = paymentIntent.amount_received / 100;

//     // Step 2: Get delivery address from DB
//     const userAddress = await UserAddress.findOne({ where: { addressId, userId } });
//     if (!userAddress) {
//       return res.status(400).json({ message: 'Invalid delivery address selected' });
//     }

//     const deliveryAddress = `${userAddress.addressLine}, ${userAddress.landmark}, ${userAddress.city}, ${userAddress.state}, ${userAddress.pincode}, ${userAddress.country}`;

//     //  Step 3: Get cart items
//     const cartItems = await CartItem.findAll({
//       where: { userId },
//       include: [Product],
//     });

//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: 'Cart is empty' });
//     }

//     let totalAmount = 0;
//     const orderItems: OrderItemInput[] = [];

//     for (const cartItem of cartItems) {
//       const product = cartItem.product;

//       if (!product || product.stock < cartItem.quantity) {
//         return res.status(400).json({
//           message: `Insufficient stock for ${product?.productName || 'a product'}`,
//         });
//       }

//       const itemTotal = cartItem.quantity * product.finalPrice;
//       totalAmount += itemTotal;

//       orderItems.push({
//         id: uuidv4(),
//         productId: product.id,
//         productName: product.productName,
//         productImage: product.productImages?.[0] || '',
//         unitPrice: product.finalPrice,
//         quantity: cartItem.quantity,
//         totalPrice: itemTotal,
//       });
//     }

//     // ✅ Step 4: Re-validate and apply coupon (if any)
//     let discountAmount = 0;

//     if (couponCode) {
//       const coupon = await Coupon.findOne({
//         where: {
//           code: couponCode,
//           expiryDate: { [Op.gt]: new Date() },
//           status: 'active',
//         },
//       });

//       if (!coupon) {
//         return res.status(400).json({ message: 'Invalid or expired coupon' });
//       }

//       if (totalAmount >= coupon.minimumOrderValue) {
//         if (coupon.discountType === 'flat') {
//           discountAmount = coupon.discountValue;
//         } else if (coupon.discountType === 'percentage') {
//           discountAmount = (coupon.discountValue / 100) * totalAmount;
//           discountAmount = Math.min(discountAmount, coupon.discountMaxLimit);
//         }

//         await Coupon.increment('usedCount', {
//           where: { couponId: coupon.couponId },
//         });

//         await UserCoupon.update(
//           { isRedeemed: true, redeemedAt: new Date() },
//           {
//             where: {
//               userId,
//               couponId: coupon.couponId,
//               isRedeemed: false,
//             },
//           }
//         );
//       }
//     }

//     const finalAmount = totalAmount - discountAmount;

//     // ✅ Step 5: Save Order
//     const order = await Order.create({
//       orderId: uuidv4(),
//       userId,
//       totalAmount: finalAmount,
//       discountAmount,
//       couponCode,
//       isPaid: true,
//       paidAmount,
//       paymentStatus: 'Paid',
//       transactionId,
//       paymentMethod: 'Card',
//       orderStatus: 'Pending',
//       deliveryType,
//       deliveryPartner: '',
//       trackingNumber: '',
//       deliveryAddress,
//       scheduledTime,
//       orderNotes: '',
//       userInstructions,
//     });

//     for (const item of orderItems) {
//       await OrderItem.create({
//         ...item,
//         orderId: order.orderId,
//       });

//       const product = await Product.findByPk(item.productId);
//       if (product) {
//         product.stock -= item.quantity;
//         await product.save();
//       }
//     }

//     await CartItem.destroy({ where: { userId } });

//     return res.status(201).json({
//       message: '✅ Order confirmed and saved',
//       orderId: order.orderId,
//       total: finalAmount,
//     });
//   } catch (error: any) {
//     console.error('❌ Error confirming order:', error.message);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// }

//transaction and roll back added 
async confirmStripeOrder(req: Request, res: Response) {
  const t = await sequelize.transaction(); // 🔁 Start transaction manually

  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;

    const {
      paymentIntentId,
      addressId,
      deliveryType,
      couponCode = '',
      scheduledTime,
      userInstructions = ''
    } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      await t.rollback();
      return res.status(400).json({ message: 'Payment not successful' });
    }

    const transactionId = paymentIntent.id;
    const paidAmount = paymentIntent.amount_received / 100;

    const userAddress = await UserAddress.findOne({ where: { addressId, userId } });
    if (!userAddress) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid delivery address selected' });
    }

    const deliveryAddress = `${userAddress.addressLine}, ${userAddress.landmark}, ${userAddress.city}, ${userAddress.state}, ${userAddress.pincode}, ${userAddress.country}`;

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [Product],
    });

    if (cartItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    const orderItems: OrderItemInput[] = [];

    for (const cartItem of cartItems) {
      // 🔒 Lock the product row inside the transaction
      const product = await Product.findByPk(cartItem.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product || product.stock < cartItem.quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${product?.productName || 'a product'}`,
        });
      }

      const itemTotal = cartItem.quantity * product.finalPrice;
      totalAmount += itemTotal;

      orderItems.push({
        id: uuidv4(),
        productId: product.id,
        productName: product.productName,
        productImage: product.productImages?.[0] || '',
        unitPrice: product.finalPrice,
        quantity: cartItem.quantity,
        totalPrice: itemTotal,
      });

      // 🛒 Deduct stock (but only save later after loop if you prefer batching)
      product.stock -= cartItem.quantity;
      await product.save({ transaction: t });
    }

    // ✅ Apply coupon (same as before)
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: {
          code: couponCode,
          expiryDate: { [Op.gt]: new Date() },
          status: 'active',
        },
        transaction: t,
      });

      if (!coupon) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }

      if (totalAmount >= coupon.minimumOrderValue) {
        if (coupon.discountType === 'flat') {
          discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'percentage') {
          discountAmount = (coupon.discountValue / 100) * totalAmount;
          discountAmount = Math.min(discountAmount, coupon.discountMaxLimit);
        }

        await Coupon.increment('usedCount', { where: { couponId: coupon.couponId }, transaction: t });

        await UserCoupon.update(
          { isRedeemed: true, redeemedAt: new Date() },
          {
            where: {
              userId,
              couponId: coupon.couponId,
              isRedeemed: false,
            },
            transaction: t,
          }
        );
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // ✅ Save order
    const order = await Order.create({
      orderId: uuidv4(),
      userId,
      totalAmount: finalAmount,
      discountAmount,
      couponCode,
      isPaid: true,
      paidAmount,
      paymentStatus: 'Paid',
      transactionId,
      paymentMethod: 'Card',
      orderStatus: 'Pending',
      deliveryType,
      deliveryPartner: '',
      trackingNumber: '',
      deliveryAddress,
      scheduledTime,
      orderNotes: '',
      userInstructions,
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        ...item,
        orderId: order.orderId,
      }, { transaction: t });
    }

    // Clean up cart
    await CartItem.destroy({ where: { userId }, transaction: t });

    await t.commit(); // ✅ All good
    return res.status(201).json({
      message: '✅ Order confirmed and saved',
      orderId: order.orderId,
      total: finalAmount,
    });

  } catch (error: any) {
    await t.rollback(); // ❌ Rollback if anything fails
    console.error('❌ Error confirming order:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}



// async cancelOrder(req: Request, res: Response) {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     const decoded: any = jwt.verify(token!, SECRET_KEY);
//     const userId = decoded.userId;

//     const { orderId } = req.params;

//     // Find the order
//     const order = await Order.findOne({
//       where: { userId, orderId },
//       include: [OrderItem],
//     });

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     // Check if the order is not already canceled or delivered
//     if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
//       return res.status(400).json({ message: 'This order cannot be canceled as it is already delivered or canceled' });
//     }

//     // Step 1: Update the order status to 'Cancelled'
//     order.orderStatus = 'Cancelled';
//     await order.save();

//     // Step 2: Restock the products
//     for (const item of order.items) {
//       const product = await Product.findByPk(item.productId);
//       if (product) {
//         product.stock += item.quantity; // Restoring the stock
//         await product.save();
//       }
//     }

//     // Step 3: If the order was paid (through Stripe or any other gateway), refund the payment (if applicable)
//     if (order.isPaid && order.paymentMethod === 'Card') {
//       const paymentIntent = await stripe.paymentIntents.retrieve(order.transactionId);
//       if (paymentIntent && paymentIntent.status === 'succeeded') {
//         // Initiating refund process using Stripe API
//         await stripe.refunds.create({ payment_intent: paymentIntent.id });
//       }
//     }

//     return res.status(200).json({
//       message: 'Order successfully canceled',
//       orderId: order.orderId,
//     });
//   } catch (error: any) {
//     console.error('❌ Error canceling order:', error.message);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// }

// In OrderController.ts

// async cancelOrder(req: Request, res: Response) {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     const decoded: any = jwt.verify(token!, SECRET_KEY);
//     const userId = decoded.userId;

//     const { orderId } = req.params;

//     // Find the order
//     const order = await Order.findOne({
//       where: { userId, orderId },
//       include: [OrderItem],
//     });

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     // Check if the order is not already canceled or delivered
//     if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
//       return res.status(400).json({ message: 'This order cannot be canceled as it is already delivered or canceled' });
//     }

//     // Step 1: Update the order status to 'Cancelled'
//     order.orderStatus = 'Cancelled';
//     order.refundStatus = 'Pending'; // Mark the refund status as pending
//     order.refundInitiatedAt = new Date(); // Record the timestamp of when the cancellation was initiated
//     await order.save();

//     // Step 2: Restock the products
//     for (const item of order.items) {
//       const product = await Product.findByPk(item.productId);
//       if (product) {
//         product.stock += item.quantity; // Restoring the stock
//         await product.save();
//       }
//     }

//     return res.status(200).json({
//       message: 'Order successfully canceled, awaiting admin verification for refund',
//       orderId: order.orderId,
//     });
//   } catch (error: any) {
//     console.error('❌ Error canceling order:', error.message);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// }




// Admin route to approve the refund after 3 business days

async cancelOrder(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);
    const userId = decoded.userId;

    const { orderId } = req.params;

    // Find the order
    const order = await Order.findOne({
      where: { userId, orderId },
      include: [OrderItem],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order is not already canceled or delivered
    if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return res.status(400).json({ message: 'This order cannot be canceled as it is already delivered or canceled' });
    }

    // Step 1: Update the order status to 'Cancelled'
    order.orderStatus = 'Cancelled';

    // Step 2: Handle refund logic
    if (order.isPaid && order.paymentMethod !== 'Cash') {
      order.refundStatus = 'Pending';
      order.refundInitiatedAt = new Date();
    } else {
      // No refund needed for unpaid or COD orders
      order.refundStatus = null;
      order.refundInitiatedAt = null;
    }

    await order.save();

    // Step 3: Restock the products
    for (const item of order.items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        product.stock += item.quantity; // Restore stock
        await product.save();
      }
    }

    return res.status(200).json({
      message: 'Order successfully canceled',
      refundStatus: order.refundStatus || 'N/A',
      orderId: order.orderId,
    });
  } catch (error: any) {
    console.error('❌ Error canceling order:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// async approveRefund(req: Request, res: Response) {
//   try {
//     const { orderId } = req.params;

//     // Find the order with pending refund status
//     const order = await Order.findOne({ where: { orderId, refundStatus: 'Pending' } });

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found or refund not pending' });
//     }
  
//     // Check if 3 business days have passed since the refund was initiated
//     const now = new Date();
//     const refundInitiatedAt = new Date(order.refundInitiatedAt);
//     const threeBusinessDaysLater = new Date(refundInitiatedAt.getTime() + 3 * 24 * 60 * 60 * 1000);

//     if (now < threeBusinessDaysLater) {
//       return res.status(400).json({ message: 'Refund cannot be approved before 3 business days' });
//     }

//     // Mark refund status as 'Approved' and process the refund
//     order.refundStatus = 'Approved';
//     await order.save();

//     // Refund the payment (using Stripe)
//     const paymentIntent = await stripe.paymentIntents.retrieve(order.transactionId);
//     if (paymentIntent && paymentIntent.status === 'succeeded') {
//       // Initiate refund
//       await stripe.refunds.create({ payment_intent: paymentIntent.id });
//       order.refundStatus = 'Refunded'; // Mark refund as completed
//       await order.save();
//     }

//     return res.status(200).json({
//       message: 'Refund approved and processed successfully',
//       orderId: order.orderId,
//     });
//   } catch (error: any) {
//     console.error('❌ Error approving refund:', error.message);
//     return res.status(500).json({ message: 'Internal Server Error', error: error.message });
//   }
// }

async approveRefund(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    // Find the order with pending refund status
    const order = await Order.findOne({ where: { orderId, refundStatus: 'Pending' } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or refund not pending' });
    }

    // ✅ Check if refundInitiatedAt is valid
    if (!order.refundInitiatedAt) {
      return res.status(400).json({ message: 'Refund initiation date is missing for this order' });
    }

    const now = new Date();
    const refundInitiatedAt = new Date(order.refundInitiatedAt);
    const threeBusinessDaysLater = new Date(refundInitiatedAt.getTime() + 3 * 24 * 60 * 60 * 1000);

    if (now < threeBusinessDaysLater) {
      return res.status(400).json({ message: 'Refund cannot be approved before 3 business days' });
    }

    // Mark refund status as 'Approved' and process the refund
    order.refundStatus = 'Approved';
    await order.save();

    // Refund the payment (using Stripe)
    const paymentIntent = await stripe.paymentIntents.retrieve(order.transactionId);
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Initiate refund
      await stripe.refunds.create({ payment_intent: paymentIntent.id });
      order.refundStatus = 'Refunded'; 
      await order.save();
    }

    return res.status(200).json({
      message: 'Refund approved and processed successfully',
      orderId: order.orderId,
    });
  } catch (error: any) {
    console.error('❌ Error approving refund:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

  async getRefundOrders(req: Request, res: Response) {
    try {
      // Get refundStatus from query parameter
      const { refundStatus } = req.query;

      // Validate refundStatus
      if (!['Pending', 'Approved', 'Refunded'].includes(String(refundStatus))) {
        return res.status(400).json({ message: 'Invalid refund status' });
      }

      // Fetch orders with the specified refund status
      const orders = await Order.findAll({
        where: { refundStatus },
        include: [
          {
            model: OrderItem,
            as: 'items',
          },
          {
            model: User,
            as: 'user',
            attributes: ['userId', 'name', 'email', 'phone'],
          },
        ],
        order: [['createdAt', 'DESC']], // Sort by the most recent orders
      });

      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found with the specified refund status' });
      }

      return res.status(200).json({ orders });
    } catch (error: any) {
      console.error('❌ Error fetching orders with refund status:', error.message);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }



async getFilteredAnalytics(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    // if (decoded.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const { startDate, endDate, category, subCategory, tag } = req.query;

    const start = startDate ? new Date(startDate as string) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate as string) : new Date();

    const orderWhere: any = {
      createdAt: {
        [Op.gte]: start,
        [Op.lte]: end,
      }
    };

    // Build product filtering condition
    const productFilter: any = {};
    if (category) productFilter.category = category;
    if (subCategory) productFilter.subCategory = subCategory;
    if (tag) productFilter.tags = { [Op.contains]: [tag] };

    // Fetch matching orders
    const orders = await Order.findAll({
      where: orderWhere,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              where: productFilter,
              required: true,
            }
          ]
        }
      ]
    });

    // Filter out orders with no matching items
    const filteredOrders = orders.filter(order => order.items.length > 0);

    // const totalRevenue = filteredOrders.reduce(
    //   (sum, order) => sum + (order.isPaid ? order.paidAmount : 0), 0
    // );
    const totalRevenue = filteredOrders.reduce((sum, order) => {
  if (order.isPaid) {
    return sum + order.paidAmount;
  } else if (order.paymentMethod === 'Cash' && order.orderStatus === 'Delivered') {
    return sum + order.totalAmount;
  } else {
    return sum;
  }
}, 0);


    const totalOrders = filteredOrders.length;

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      category: category || 'All',
      subCategory: subCategory || 'All',
      tag: tag || 'All',
    });
  } catch (error: any) {
    console.error('❌ Error in filtered analytics:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async getRecentOrders(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    // const adminUser = await User.findByPk(decoded.userId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const orders = await Order.findAll({
      limit,
      order: [['createdAt', sort]],
      include: [
        {
          model: OrderItem,
          as: 'items',
          attributes: ['productName', 'quantity']
        },
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'name', 'email', 'phone']
        }
      ]
    });

    const formatted = orders.map(order => ({
      orderId: order.orderId,
      user: order.user,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      deliveryType: order.deliveryType,
      scheduledTime: order.scheduledTime,
      items: order.items.map(item => ({
        name: item.productName,
        quantity: item.quantity
      }))
    }));

    return res.status(200).json({ recentOrders: formatted });
  } catch (error: any) {
    console.error('❌ Error fetching recent orders:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


async getTopSellingProducts(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    // const adminUser = await User.findByPk(decoded.userId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const limit = parseInt(req.query.limit as string) || 10;

    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        'productName',
        'productImage',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.col('totalPrice')), 'totalRevenue']
      ],
      group: ['productId', 'productName', 'productImage'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit
    });

    return res.status(200).json({ topSellingProducts: topProducts });
  } catch (error: any) {
    console.error('❌ Error fetching top selling products:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


async updateOrderStatus(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    // const adminUser = await User.findByPk(decoded.userId);
    // if (!adminUser || adminUser.role !== 'admin') {
    //   return res.status(403).json({ message: 'Access denied. Admins only.' });
    // }

    const { orderId } = req.params;
    const { orderStatus, deliveryPartner, trackingNumber } = req.body;

    // Validate status
    const allowedStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update values
    order.orderStatus = orderStatus;
    if (deliveryPartner) order.deliveryPartner = deliveryPartner;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    return res.status(200).json({ message: '✅ Order status updated successfully', order });
  } catch (error: any) {
    console.error('❌ Error updating order status:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


async markCodPaymentReceived(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow update for COD and not already paid
    if (order.paymentMethod !== 'Cash') {
      return res.status(400).json({ message: 'This is not a COD order' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'COD payment already marked as received' });
    }

    // Mark as delivered and paid
    order.orderStatus = 'Delivered';
    order.isPaid = true;
    order.paymentStatus = 'Paid';
    order.paidAmount = order.totalAmount;

    await order.save();

    return res.status(200).json({
      message: '✅ COD payment marked as received and order delivered',
      order,
    });
  } catch (error: any) {
    console.error('❌ Error marking COD payment as received:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}



async getFilteredPaymentOrders(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded: any = jwt.verify(token!, SECRET_KEY);

    // Extract query parameters
    const paymentMethod = String(req.query.method).trim();
    const paymentStatus = String(req.query.status).trim();

    const validMethods = ['Cash', 'UPI', 'Card', 'Wallet'];
    const validStatuses = ['Paid', 'Pending', 'Failed'];

    // Validation
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    // Query database with filters
    const orders = await Order.findAll({
      where: {
        paymentMethod,
        paymentStatus,
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: User,
          as: 'user',
          attributes: ['userId', 'name', 'email', 'phone'],
        },
      ],
    });

    return res.status(200).json({ orders });
  } catch (error: any) {
    console.error('❌ Error fetching filtered payment orders:', error.message);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

}