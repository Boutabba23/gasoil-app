// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

// Extend Express Request type to include 'user'
export interface AuthenticatedRequest extends Request {
  user?: IUser; // Or the specific type of your decoded token payload
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void | Response> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded: any = jwt.verify(token, JWT_SECRET); // Consider defining a type for 'decoded'

      // Get user from the token (assuming googleId is stored in JWT)
      // If you store the MongoDB _id in JWT, query by _id
      const userFromDb: IUser | null = await User.findOne({ googleId: decoded.googleId }).select('-__v');

      if (!userFromDb) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = userFromDb; // Attach user to the request object
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};