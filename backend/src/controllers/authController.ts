// src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Helper function to generate JWT
const generateToken = (user: IUser): string => {
  // Include necessary user identifiers in the token payload
  return jwt.sign({ googleId: user.googleId, id: user._id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const googleCallback = (req: Request, res: Response): void => {
  // Passport attaches the user to req.user after successful authentication
  const user = req.user as IUser;

  if (!user) {
    // Should not happen if passport.authenticate was successful
    console.error('User not found after Google OAuth callback');
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    return;
  }

  const token = generateToken(user);

  // Redirect to client with token (e.g., in query parameter or hash)
  // Client will then store token and make authenticated requests
  res.redirect(`${CLIENT_URL}/auth/callback?token=${token}`);
};

export const getMe = (req: AuthenticatedRequest, res: Response): Response => {
  // req.user is populated by the 'protect' middleware
  if (!req.user) {
    // This case should ideally be caught by 'protect' middleware
    return res.status(404).json({ message: 'User not found' });
  }

  // Return only necessary user information
  const { _id, googleId, displayName, email, profilePicture } = req.user;
  return res.status(200).json({ _id, googleId, displayName, email, profilePicture });
};

export const logout = (req: AuthenticatedRequest, res: Response): Response => {
  // For JWT, logout is primarily a client-side action (clearing the token).
  // Server-side, you might want to blacklist the token if you have such a system.
  // For this basic setup, we'll just acknowledge.
  
  // If using sessions, it would be:
  req.logout((err) => {
     if (err) { return next(err); }
     req.session.destroy((err) => {
       if (err) {
         console.error('Session destruction error:', err);
         return res.status(500).json({ message: "Could not log out."});
       }
       res.clearCookie('connect.sid'); // Or your session cookie name
       res.status(200).json({ message: 'Logged out successfully' });
     });
   });

  return res.status(200).json({ message: 'Logged out successfully (client should clear token)' });
};

function next(err: any): void {
  throw new Error('Function not implemented.');
}
