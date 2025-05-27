import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'; // <<< Import JwtPayload
import User from '../models/User'; // Mongoose User model
import type { IUser } from '../models/User'; // IUser type interface

interface DecodedToken extends JwtPayload {
  googleId: string;
  id: string; // This should be the MongoDB _id of the User
  iat: number;
  exp: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;
  // console.log("Protect middleware: Auth header:", req.headers.authorization); // Debug log

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        console.error("Protect middleware: JWT_SECRET is not defined!");
        res.status(500).json({ message: 'Erreur de configuration serveur.' });
        return; 
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
      // console.log("Protect middleware: Token decoded:", decoded);

      const userFromDb = await User.findById(decoded.id).select('-__v');

      if (!userFromDb) {
        console.log("Protect middleware: User not found in DB for token ID:", decoded.id);
        res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé.' });
        return;
      }
      
      // console.log("Protect middleware: User found:", userFromDb.displayName);
      // Assign the Mongoose document to req.user. 
      // Downstream will cast it to IUser.
      req.user = userFromDb; // TypeScript implicitly knows userFromDb is IUser compatible
      next();
      return; 
    } catch (error: any) {
      console.error("Protect middleware: Token error:", error.name, error.message);
      let message = 'Non autorisé, token invalide ou expiré.';
      if (error.name === 'TokenExpiredError') message = 'Session expirée, veuillez vous reconnecter.';
      else if (error.name === 'JsonWebTokenError') message = 'Token malformé ou invalide.';
      res.status(401).json({ message });
      return; 
    }
  }
  
  // If token was never extracted from header (e.g., no auth header or wrong format)
  // This ensures we always send a response or call next()
  if (!token) { 
    console.log("Protect middleware: No Bearer token found in Authorization header.");
    res.status(401).json({ message: 'Non autorisé, pas de token fourni ou format incorrect.' });
    return;
  }
};