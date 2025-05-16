import { Response } from 'express';
import mongoose from 'mongoose'; // Import mongoose for ObjectId validation
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import ConversionTableEntry from '../models/ConversionTableEntry';
import Conversion from '../models/Conversion';

// --- Convert CM to Litres (existing function) ---
export const convertCmToLitres = async (req: AuthenticatedRequest, res: Response) => {
  const { value_cm } = req.body;
  const userId = req.user?.googleId;

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
    });
    await newConversion.save();

    res.status(200).json({
      value_cm: cm,
      volume_l: entry.litres,
      message: `${cm} cm ➜ ${entry.litres} L`,
      savedConversion: newConversion
    });
  } catch (error: any) {
    console.error('Error during conversion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la conversion.', error: error.message });
  }
};

// --- Get Conversion History (existing function, slight modification for search/date) ---
export const getConversionHistory = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.googleId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Basic query object
  const query: any = { userId };

  // Optional: Add search and date filtering if passed from frontend
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    const searchNumber = parseFloat(searchTerm);
    if (!isNaN(searchNumber)) {
      query.$or = [
        { value_cm: searchNumber },
        { volume_l: searchNumber }
      ];
    } else {
      // If you want to search by other text fields, add them here
      // For this model, only numbers make sense unless you search by date string parts
    }
  }
  if (req.query.from && req.query.to) {
    query.createdAt = {
      $gte: new Date(req.query.from as string),
      $lte: new Date(req.query.to as string)
    };
  } else if (req.query.from) {
    query.createdAt = { $gte: new Date(req.query.from as string) };
  } else if (req.query.to) {
    query.createdAt = { $lte: new Date(req.query.to as string) };
  }


  try {
    const conversions = await Conversion.find(query)
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
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique.', error: error.message });
  }
};

// --- NEW: Delete Conversion Entry ---
export const deleteConversionEntry = async (req: AuthenticatedRequest, res: Response) => {
  const entryId = req.params.id;
  const userId = req.user?.googleId; // Or req.user._id based on your user model reference in Conversion schema

  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    return res.status(400).json({ message: 'ID de l\'entrée de conversion invalide.' });
  }

  try {
    const conversionEntry = await Conversion.findById(entryId);

    if (!conversionEntry) {
      return res.status(404).json({ message: 'Entrée de conversion non trouvée.' });
    }

    // Security Check: Ensure the user owns this entry
    if (conversionEntry.userId !== userId) {
      console.warn(`User ${userId} attempt to delete entry ${entryId} owned by ${conversionEntry.userId}`);
      return res.status(403).json({ message: 'Non autorisé à supprimer cette entrée.' });
    }

    await conversionEntry.deleteOne(); // Mongoose v6+ recommend deleteOne on document instance
                                      // For older: await Conversion.findByIdAndDelete(entryId);
    
    console.log(`Conversion entry ${entryId} deleted by user ${userId}`);
    res.status(200).json({ message: 'Entrée de conversion supprimée avec succès.' });

  } catch (error: any) {
    console.error(`Error deleting conversion entry ${entryId} for user ${userId}:`, error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'entrée.', error: error.message });
  }
};