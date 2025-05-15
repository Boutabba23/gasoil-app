// src/controllers/conversionController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import ConversionTableEntry from '../models/ConversionTableEntry';
import Conversion from '../models/Conversion';

export const convertCmToLitres = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  const { value_cm } = req.body;

  if (!req.user || !req.user.googleId) {
    // This should be caught by protect middleware, but good to double-check
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.user.googleId; // Or req.user._id if you use MongoDB ObjectId as primary user ref

  if (value_cm === undefined || value_cm === null) {
    return res.status(400).json({ message: 'La valeur en cm est requise.' });
  }

  const cm = Number(value_cm);
  if (isNaN(cm) || cm < 0 || cm > 300) {
    return res.status(400).json({ message: 'Valeur en cm invalide ou hors plage (0-300 cm).' });
  }

  try {
    const entry = await ConversionTableEntry.findOne({ cm });
    if (!entry) {
      return res.status(404).json({ message: `Aucune conversion trouvée pour ${cm} cm.` });
    }

    const newConversion = new Conversion({
      userId: userId,
      value_cm: cm,
      volume_l: entry.litres,
      // createdAt is added automatically by timestamps: true
    });
    await newConversion.save();

    return res.status(200).json({
      value_cm: cm,
      volume_l: entry.litres,
      message: `${cm} cm ➜ ${entry.litres} L`,
      savedConversion: newConversion,
    });
  } catch (error: any) {
    console.error('Error during conversion:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la conversion.', error: error.message });
  }
};

export const getConversionHistory = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  if (!req.user || !req.user.googleId) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  const userId = req.user.googleId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const conversions = await Conversion.find({ userId })
      .sort({ createdAt: -1 }) // Sort by most recent
      .skip(skip)
      .limit(limit);

    const totalConversions = await Conversion.countDocuments({ userId });

    return res.status(200).json({
      data: conversions,
      currentPage: page,
      totalPages: Math.ceil(totalConversions / limit),
      totalItems: totalConversions,
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique.', error: error.message });
  }
};