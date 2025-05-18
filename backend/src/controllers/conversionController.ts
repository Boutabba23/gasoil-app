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
export const getConversionHistory = async (req: Request, res: Response):Promise<void> => {
   const currentUser = req.user as IUser | undefined;
  const userId = currentUser?.googleId;

  if (!userId) {
    res.status(401).json({ message: "Utilisateur non authentifié." });
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: mongoose.FilterQuery<typeof Conversion> = { userId };

  // Search Term Filter (existing logic)
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    const searchNumber = parseFloat(searchTerm);
    if (!isNaN(searchNumber)) {
      query.$or = [
        { value_cm: searchNumber },
        { volume_l: searchNumber }
      ];
    }
  }

 // --- ADDED/MODIFIED DATE RANGE FILTER LOGIC ---
  const fromDateString = req.query.from as string | undefined;
  const toDateString = req.query.to as string | undefined;

  if (fromDateString || toDateString) {
    query.createdAt = {}; 
    if (fromDateString) {
      const dateFrom = new Date(fromDateString);
      dateFrom.setUTCHours(0, 0, 0, 0); 
      if (!isNaN(dateFrom.getTime())) {
        query.createdAt.$gte = dateFrom;
        console.log("Filtering from date (backend):", dateFrom.toISOString());
      } else {
        console.warn("Invalid 'from' date received:", fromDateString);
      }
    }
    if (toDateString) {
      const dateTo = new Date(toDateString);
      dateTo.setUTCHours(23, 59, 59, 999); 
      if (!isNaN(dateTo.getTime())) {
        query.createdAt.$lte = dateTo;
        console.log("Filtering to date (backend):", dateTo.toISOString());
      } else {
        console.warn("Invalid 'to' date received:", toDateString);
      }
    }
    if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
    }
  }
  console.log("Executing history query (backend):", JSON.stringify(query));
   try {
    const conversions = await Conversion.find(query)
      // ... (rest of the find, sort, skip, limit logic) ...
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalConversions = await Conversion.countDocuments(query);

    res.status(200).json({
      data: conversions,
      currentPage: page,
      totalPages: Math.ceil(totalConversions / limit),
      totalItems: totalConversions,
    });
  } catch (error: any) {
    // ... (error handling) ...
  }
};



// --- Delete Conversion Entry ---
export const deleteConversionEntry = async (req: Request, res: Response): Promise<void> => {
  const userFromRequest = req.user as IUser | undefined;
  const userId = userFromRequest?.googleId;
  const entryId = req.params.id;

  if (!userId) { // Check if user is authenticated (protect middleware should ensure this though)
    res.status(401).json({ message: 'Utilisateur non authentifié pour la suppression.' });
    return;
  }

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