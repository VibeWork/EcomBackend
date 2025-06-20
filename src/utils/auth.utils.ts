// src/utils/auth.util.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'default_secret';

export interface DecodedToken {
  userId: string;
  email?: string;
  role?: string;
  [key: string]: any;
  firebaseId:string;
}

export const verifyJwtToken = (authHeader?: string): DecodedToken => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid token');
  }  

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, SECRET_KEY) as DecodedToken;
  } catch {
    throw new Error('Invalid or expired token');
  }
};
