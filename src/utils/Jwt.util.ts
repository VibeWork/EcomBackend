import jwt, { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET_KEY: Secret = process.env.JWT_SECRET_KEY || "default_secret";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1y") as unknown as SignOptions["expiresIn"];

interface Payload {
  userId: string;
  email?: string;
  role?: "user" | "admin";
  [key: string]: any;
  firebaseId:string;
}

export const generateToken = (payload: Payload): string => {
  return jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token: string): Payload => {
  return jwt.verify(token, JWT_SECRET_KEY) as Payload;
};
