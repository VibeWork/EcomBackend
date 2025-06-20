// src/middlewares/admin.middleware.ts
import { Request, Response, NextFunction } from "express";
import { auth as firebaseAuth } from "../config/firebase";
import { verifyToken } from "../utils/Jwt.util";

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // const decodedToken = await firebaseAuth.verifyIdToken(token);
      const decodedToken = verifyToken(token);

    if (decodedToken.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    (req as any).user = decodedToken;
    next();
  } catch (err) {
    console.error("❌ Firebase token verification failed:", err);
    return res.status(403).json({ message: "Invalid Firebase token" });
  }
};
