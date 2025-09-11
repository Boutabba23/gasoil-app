import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { supabase } from '../config/supabase';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;

  console.log("Auth Controller: getMe called. User:", currentUser ? currentUser.name : 'No user');

  if (!currentUser) {
    res.status(404).json({ message: 'Utilisateur non trouvé (getMe).' });
    return;
  }

  res.status(200).json({
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    picture: currentUser.picture,
  });
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  console.log("Auth Controller: Logout endpoint hit.");

  // In Supabase, you would typically use supabase.auth.signOut()
  // But since this is a server-side API, we'll just return a success message
  // The client-side should handle the actual logout with Supabase Auth

  res.status(200).json({ message: 'Déconnexion serveur initiée.' });
};

// Helper function to generate JWT token
export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const defaultExpiresInSeconds = 24 * 60 * 60; // 1 day
  let expiresInNumeric = defaultExpiresInSeconds;

  if (process.env.JWT_EXPIRES_IN_SECONDS) {
    const parsed = parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10);
    if (!isNaN(parsed) && parsed > 0) {
      expiresInNumeric = parsed;
    }
  }

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined!");
  }

  const payload = {
    sub: userId,
  };

  const options: SignOptions = { expiresIn: expiresInNumeric };

  return jwt.sign(payload, jwtSecret, options);
};
