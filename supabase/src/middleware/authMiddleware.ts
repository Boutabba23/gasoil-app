import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

interface DecodedToken {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  iat: number;
  exp: number;
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        console.error("Protect middleware: JWT_SECRET is not defined!");
        res.status(500).json({ message: 'Erreur de configuration serveur.' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;

      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.sub)
        .single();

      if (error || !user) {
        console.log("Protect middleware: User not found in Supabase for ID:", decoded.sub);
        res.status(401).json({ message: 'Non autorisé, utilisateur non trouvé.' });
        return;
      }

      // Add user to request
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.avatar_url
      };

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

  if (!token) {
    console.log("Protect middleware: No Bearer token found in Authorization header.");
    res.status(401).json({ message: 'Non autorisé, pas de token fourni ou format incorrect.' });
    return;
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Non autorisé, utilisateur non authentifié.' });
    return;
  }

  // In a real implementation, you would check the user's role in the database
  // For now, we'll use a simple environment variable check
  const adminGoogleId = process.env.ADMIN_GOOGLE_ID;

  if (!adminGoogleId || req.user.id !== adminGoogleId) {
    res.status(403).json({ message: 'Action non autorisée. Privilèges administrateur requis.' });
    return;
  }

  next();
};
