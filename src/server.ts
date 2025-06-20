
// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './config/Database.config';
import authRoutes from "./routes/Auth.routes"
import productRoutes from "./routes/Product.routes";
import cartRoutes from "./routes/Cart.routes";
import orderRoutes from "./routes/Order.route";
import couponRoutes from "./routes/coupon.routes";
import userAddress from "./routes/UserAddress.route";
import userRoutes from "./routes/User.routes";
import bodyParser from 'body-parser';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use('/api/orders/webhook/stripe', bodyParser.raw({ type: 'application/json' }));
// Middlewares
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/Cart",cartRoutes);
app.use("/api/orders",orderRoutes);
app.use("/api/coupons",couponRoutes);
app.use("/api/address",userAddress);
app.use("/api/users",userRoutes);





// Health Check Route
app.get('/', (_req, res) => {
  res.send('Food Delivery API is running...');
});

// Connect to DB and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected via Sequelize');

    // Optionally show registered models
    const models = sequelize.modelManager.models.map((m) => m.name);
    console.log('🔍 Registered Models:', models.length ? models : 'None');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1); // Exit on DB failure
  }
};  


startServer();

