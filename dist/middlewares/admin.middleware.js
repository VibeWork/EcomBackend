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
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = void 0;
const Jwt_util_1 = require("../utils/Jwt.util");
const adminOnly = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        // const decodedToken = await firebaseAuth.verifyIdToken(token);
        const decodedToken = (0, Jwt_util_1.verifyToken)(token);
        if (decodedToken.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        req.user = decodedToken;
        next();
    }
    catch (err) {
        console.error("❌ Firebase token verification failed:", err);
        return res.status(403).json({ message: "Invalid Firebase token" });
    }
});
exports.adminOnly = adminOnly;
