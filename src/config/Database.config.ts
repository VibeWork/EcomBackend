
//config/Database.config.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import User from '../models/User.model';
import Product from '../models/Product.Model';
import CartItem from '../models/Cart.Model';
import Order from '../models/Order.model';
import OrderItem from '../models/OrderItem.model';
import Coupon from '../models/Coupon.model';
import UserCoupon from '../models/UserCoupon.model';
import UserAddress from '../models/UserAddress.model';


dotenv.config();

// Create new Sequelize instance
export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 6543,
  models: [User,Product,CartItem,Order,OrderItem,Coupon,UserCoupon,UserAddress],
  logging: false,

  
  dialectOptions: {
    ssl: {
      require: true, // Enforce SSL connection
      rejectUnauthorized: false // Bypass self-signed certificate issues
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
