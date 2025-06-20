"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
//config/Database.config.ts
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Product_Model_1 = __importDefault(require("../models/Product.Model"));
const Cart_Model_1 = __importDefault(require("../models/Cart.Model"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const OrderItem_model_1 = __importDefault(require("../models/OrderItem.model"));
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const UserCoupon_model_1 = __importDefault(require("../models/UserCoupon.model"));
const UserAddress_model_1 = __importDefault(require("../models/UserAddress.model"));
dotenv_1.default.config();
// Create new Sequelize instance
exports.sequelize = new sequelize_typescript_1.Sequelize({
    database: process.env.DB_NAME,
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 6543,
    models: [User_model_1.default, Product_Model_1.default, Cart_Model_1.default, Order_model_1.default, OrderItem_model_1.default, Coupon_model_1.default, UserCoupon_model_1.default, UserAddress_model_1.default],
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
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
