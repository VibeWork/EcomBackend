"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = void 0;
// src/utils/auth.util.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret';
const verifyJwtToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Missing or invalid token');
    }
    const token = authHeader.split(' ')[1];
    try {
        return jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (_a) {
        throw new Error('Invalid or expired token');
    }
};
exports.verifyJwtToken = verifyJwtToken;
