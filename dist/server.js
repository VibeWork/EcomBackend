"use strict";
// // src/server.ts
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import { sequelize } from './config/Database.config';
// // import routes from './routes';
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
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;
// // Middleware
// app.use(cors());
// app.use(express.json());
// // Routes
// // app.use('/api', routes);
// // Root Health Check
// app.get('/', (_req, res) => {
//   res.send('Food Delivery API is running...');
// });
// // // DB Connection
// // (async () => {
// //   try {
// //     await sequelize.authenticate();
// //     console.log('✅ PostgreSQL connected via Sequelize.');
// //   } catch (error) {
// //     console.error('❌ Unable to connect to the database:', error);
// //   }
// // })();
// sequelize
//   .authenticate()
//   .then(async () => {
//     console.log('✅ Sequelize connected & models registered');
//     // Optionally, log all registered models to verify
//     console.log(
//       '🔍 Registered Models:',
//       sequelize.modelManager.models.map(m => m.name),
//     );
// // Start Server  
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const Database_config_1 = require("./config/Database.config");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
