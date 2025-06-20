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
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const Database_config_1 = require("./config/Database.config");
const Auth_routes_1 = __importDefault(require("./routes/Auth.routes"));
const Product_routes_1 = __importDefault(require("./routes/Product.routes"));
const Cart_routes_1 = __importDefault(require("./routes/Cart.routes"));
const Order_route_1 = __importDefault(require("./routes/Order.route"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const UserAddress_route_1 = __importDefault(require("./routes/UserAddress.route"));
const User_routes_1 = __importDefault(require("./routes/User.routes"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use('/api/orders/webhook/stripe', body_parser_1.default.raw({ type: 'application/json' }));
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", Auth_routes_1.default);
app.use("/api/products", Product_routes_1.default);
app.use("/api/Cart", Cart_routes_1.default);
app.use("/api/orders", Order_route_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/address", UserAddress_route_1.default);
app.use("/api/users", User_routes_1.default);
// Health Check Route
app.get('/', (_req, res) => {
    res.send('Food Delivery API is running...');
});
// Connect to DB and start server
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Database_config_1.sequelize.authenticate();
        console.log('✅ PostgreSQL connected via Sequelize');
        // Optionally show registered models
        const models = Database_config_1.sequelize.modelManager.models.map((m) => m.name);
        console.log('🔍 Registered Models:', models.length ? models : 'None');
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1); // Exit on DB failure
    }
});
startServer();
