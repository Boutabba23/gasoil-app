import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User'; // <<<< IMPORT IUser Interface

export const googleCallback = (req: Request, res: Response): void => {
  // Cast req.user to IUser | undefined immediately
  const authenticatedUser = req.user as IUser | undefined;

  if (!authenticatedUser || !authenticatedUser.googleId || !authenticatedUser._id) { 
    console.error("Auth Controller: googleCallback - req.user is missing key fields:", authenticatedUser);
    res.status(401).redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=auth_user_incomplete`);
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  const defaultExpiresInSeconds = 24 * 60 * 60; // 1 day
  let expiresInNumeric = defaultExpiresInSeconds;

  if (process.env.JWT_EXPIRES_IN_SECONDS) {
    const parsed = parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10);
    if (!isNaN(parsed) && parsed > 0) {
      expiresInNumeric = parsed;
    } else {
      console.warn(`Auth Controller: Invalid JWT_EXPIRES_IN_SECONDS value "${process.env.JWT_EXPIRES_IN_SECONDS}". Defaulting to ${defaultExpiresInSeconds}s.`);
    }
  } else {
    // console.log(`Auth Controller: JWT_EXPIRES_IN_SECONDS not set. Defaulting to ${defaultExpiresInSeconds}s.`);
  }

  if (!jwtSecret) {
    console.error("Auth Controller: JWT_SECRET is not defined! Cannot sign token.");
    res.status(500).redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=server_config_error_jwt_secret`);
    return;
  }

  // Now use authenticatedUser which is typed as IUser | undefined
  const payload = {
    googleId: authenticatedUser.googleId,
    id: authenticatedUser._id.toString(), // _id from IUser
  };

  const options: SignOptions = { expiresIn: expiresInNumeric };

  try {
    const token = jwt.sign(payload, jwtSecret, options);
    console.log(`Auth Controller: Token for ${authenticatedUser.displayName}, redirecting.`); // displayName from IUser
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Auth Controller: Error signing JWT:", error);
    res.status(500).redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=jwt_sign_error`);
  }
};

export const getMe = (req: Request, res: Response): void => {
  // Cast req.user to IUser | undefined immediately
  const currentUser = req.user as IUser | undefined;

  console.log("Auth Controller: getMe called. req.user:", currentUser ? currentUser.displayName : 'No user');
  
  if (!currentUser) {
    res.status(404).json({ message: 'Utilisateur non trouvé (getMe).' });
    return;
  }

  // Now use currentUser which is typed as IUser | undefined
  // TypeScript knows properties like ._id, .googleId, .displayName, .email, .profilePicture exist
  res.status(200).json({
    _id: currentUser._id,
    googleId: currentUser.googleId,
    displayName: currentUser.displayName,
    email: currentUser.email,
    profilePicture: currentUser.profilePicture,
  });
};

export const logout = (req: Request, res: Response): void => {
  // console.log("Auth Controller: Logout endpoint hit."); // Optional log
  res.status(200).json({ message: 'Déconnexion serveur initiée.' });
};