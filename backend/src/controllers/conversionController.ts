import { Response } from 'express';
import mongoose from 'mongoose';
import { Request } from 'express'; // Using standard Request
import ConversionTableEntry from '../models/ConversionTableEntry';
import Conversion from '../models/Conversion';
import type { IUser } from '../models/User';

// --- Convert CM to Litres ---
export const convertCmToLitres = async (req: Request, res: Response): Promise<void> => {
  const userFromRequest = req.user as IUser | undefined;
  const userId = userFromRequest?.googleId;
  const { value_cm } = req.body;

  if (value_cm === undefined || value_cm === null) {
    res.status(400).json({ message: 'La valeur en cm est requise.' });
    return; // Explicit return after sending response
  }

  const cm = Number(value_cm);
  if (isNaN(cm) || cm < 0 || cm > 300) {
    res.status(400).json({ message: 'Valeur en cm invalide ou hors plage (0-300 cm).' });
    return; // Explicit return
  }

  try {
    const entry = await ConversionTableEntry.findOne({ cm });
    if (!entry) {
      res.status(404).json({ message: `Aucune conversion trouvée pour ${cm} cm.` });
      return; // Explicit return
    }

    const newConversion = new Conversion({
      userId: userId,
      value_cm: cm,
      volume_l: entry.litres,
    });
    await newConversion.save();

    res.status(200).json({
      value_cm: cm,
      volume_l: entry.litres,
      message: `${cm} cm ➜ ${entry.litres} L`,
      savedConversion: newConversion
    });
    // No explicit return needed here if res.status().json() is the last statement in this try block path
  } catch (error: any) {
    console.error('Error during conversion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la conversion.', error: error.message });
    // No explicit return needed here if res.status().json() is the last statement in catch block
  }
};

// --- Get Conversion History ---
export const getConversionHistory = async (req: Request, res: Response): Promise<void> => {
  const userFromRequest = req.user as IUser | undefined;
  const userId = userFromRequest?.googleId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const query: any = { userId };

  // Add search and date filtering (simplified for brevity, use your full logic)
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    const searchNumber = parseFloat(searchTerm);
    if (!isNaN(searchNumber)) {
      query.$or = [{ value_cm: searchNumber }, { volume_l: searchNumber }];
    }
  }
  if (req.query.from && req.query.to) {
    query.createdAt = { $gte: new Date(req.query.from as string), $lte: new Date(req.query.to as string) };
  } else if (req.query.from) {
    query.createdAt = { $gte: new Date(req.query.from as string) };
  } else if (req.query.to) {
    query.createdAt = { $lte: new Date(req.query.to as string) };
  }

  try {
    const conversions = await Conversion.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const totalConversions = await Conversion.countDocuments(query);
    res.status(200).json({
      data: conversions,
      currentPage: page,
      totalPages: Math.ceil(totalConversions / limit),
      totalItems: totalConversions,
    });
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique.', error: error.message });
  }
};

// --- Delete Conversion Entry ---
export const deleteConversionEntry = async (req: Request, res: Response): Promise<void> => {
  const userFromRequest = req.user as IUser | undefined;
  const userId = userFromRequest?.googleId;
  const entryId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    res.status(400).json({ message: 'ID de l\'entrée de conversion invalide.' });
    return; // Explicit return
  }

  try {
    const conversionEntry = await Conversion.findById(entryId);
    if (!conversionEntry) {
      res.status(404).json({ message: 'Entrée de conversion non trouvée.' });
      return; // Explicit return
    }

    if (conversionEntry.userId !== userId) {
      console.warn(`User ${userId} attempt to delete entry ${entryId} owned by ${conversionEntry.userId}`);
      res.status(403).json({ message: 'Non autorisé à supprimer cette entrée.' });
      return; // Explicit return
    }

    await conversionEntry.deleteOne();
    console.log(`Conversion entry ${entryId} deleted by user ${userId}`);
    res.status(200).json({ message: 'Entrée de conversion supprimée avec succès.' });
  } catch (error: any) {
    console.error(`Error deleting conversion entry ${entryId} for user ${userId}:`, error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'entrée.', error: error.message });
  }
};