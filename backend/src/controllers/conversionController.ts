import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ConversionTableEntry from '../models/ConversionTableEntry';
import Conversion from '../models/Conversion'; // Your Conversion model
import User, { IUser } from '../models/User';   // Your User model and IUser interface for casting

// --- Convert CM to Litres ---
export const convertCmToLitres = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user as IUser | undefined; // Cast req.user

  // Ensure user is authenticated (should be handled by 'protect' middleware but good check)
  if (!currentUser || !currentUser.googleId) {
    res.status(401).json({ message: 'Utilisateur non authentifié ou ID Google manquant.' });
    return;
  }
  
  const userIdToSave = currentUser.googleId; // Storing the Google ID string
  const { value_cm } = req.body;

  if (value_cm === undefined || value_cm === null) {
    res.status(400).json({ message: 'La valeur en cm est requise.' });
    return;
  }

  const cm = Number(value_cm);
  if (isNaN(cm) || cm < 0 || cm > 300) {
    res.status(400).json({ message: 'Valeur en cm invalide ou hors plage (0-300 cm).' });
    return;
  }

  try {
    const entry = await ConversionTableEntry.findOne({ cm });
    if (!entry) {
      res.status(404).json({ message: `Aucune conversion trouvée pour ${cm} cm.` });
      return;
    }

    const newConversion = new Conversion({
      userId: userIdToSave, // Save the googleId string
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

// server/src/controllers/conversionController.ts
// ... (other imports: Request, Response, mongoose, Conversion, IUser) ...

// ... (convertCmToLitres, getConversionHistory, deleteConversionEntry functions) ...

export const bulkDeleteConversionEntries = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user as IUser | undefined;
  const { ids } = req.body; // Expect an array of entry IDs in the request body
  console.log("BULK DELETE: Received request. User:", currentUser?.googleId, "IDs to delete:", ids); // Log received data

  if (!currentUser || !currentUser.googleId) {
    res.status(401).json({ message: 'Utilisateur non authentifié.' });
    return;
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'Liste d\'IDs requise pour la suppression groupée.' });
    return;
  }

  // Validate all IDs
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: `ID de conversion invalide trouvé: ${id}` });
      return;
    }
  }

  try {
    // Fetch the entries to verify ownership before deleting
    // This is important for security.
    const entriesToDelete = await Conversion.find({ 
      _id: { $in: ids },
      // userId: currentUser.googleId // CRUCIAL: Only allow deleting own entries
    });

    const ownedEntryIds = entriesToDelete
        .filter(entry => entry.userId === currentUser.googleId) // Double check ownership
        .map(entry => entry._id);

    if (ownedEntryIds.length === 0) {
      res.status(403).json({ message: 'Aucune entrée valide à supprimer ou non autorisé.' });
      return;
    }
    
    // If some entries were not owned or not found, you could inform the user,
    // but for now, we proceed with deleting only the owned ones.
    if (ownedEntryIds.length < ids.length) {
        console.warn(`Bulk delete: User ${currentUser.googleId} attempted to delete non-owned/non-existent entries. Only ${ownedEntryIds.length} of ${ids.length} will be deleted.`);
    }


    const deleteResult = await Conversion.deleteMany({ 
      _id: { $in: ownedEntryIds }, // Only delete IDs confirmed to be owned
      // userId: currentUser.googleId // Redundant if already filtered above, but good for direct deleteMany without pre-fetch
    });
    console.log("BULK DELETE: Mongoose deleteMany result:", deleteResult);

    if (deleteResult.deletedCount > 0) {
      console.log(`${deleteResult.deletedCount} conversion entries bulk deleted by user ${currentUser.googleId}`);
      res.status(200).json({ message: `${deleteResult.deletedCount} entrée(s) supprimée(s) avec succès.` });
    } else {
      // This case might happen if pre-fetched entries were somehow deleted before this step,
      // or if none of the provided IDs matched owned entries after the filter.
      console.log("BULK DELETE: Mongoose deleteMany reported 0 documents deleted, though ownedEntryIds were found.");
      res.status(404).json({ message: 'Aucune entrée correspondante trouvée pour la suppression (ou non autorisé).' });

    }

  } catch (error: any) {
    console.error('Error during bulk delete conversion entries:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression groupée.', error: error.message });
  }
};

// --- Get Conversion History ---
export const getConversionHistory = async (req: Request, res: Response): Promise<void> => {
  const accessorUser = req.user as IUser | undefined; // For logging who accessed
  const accessorUserIdForLog = accessorUser?.googleId || accessorUser?._id || 'Système'; 
  console.log(`User/Accessor ${accessorUserIdForLog} is accessing global conversion history.`);
 
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const query: mongoose.FilterQuery<typeof Conversion> = {}; // No userId filter for global history

  // Search Term Filter
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    const searchNumber = parseFloat(searchTerm);
    if (!isNaN(searchNumber)) {
      query.$or = [ { value_cm: searchNumber }, { volume_l: searchNumber } ];
    }
  }

  // Date Range Filter
  const fromDateString = req.query.from as string | undefined;
  const toDateString = req.query.to as string | undefined;
  if (fromDateString || toDateString) {
    query.createdAt = {}; 
    if (fromDateString) {
      const dateFrom = new Date(fromDateString);
      dateFrom.setUTCHours(0, 0, 0, 0); 
      if (!isNaN(dateFrom.getTime())) query.createdAt.$gte = dateFrom;
    }
    if (toDateString) {
      const dateTo = new Date(toDateString);
      dateTo.setUTCHours(23, 59, 59, 999); 
      if (!isNaN(dateTo.getTime())) query.createdAt.$lte = dateTo;
    }
    if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
  }

  console.log("Executing GLOBAL history query (backend):", JSON.stringify(query));
   try {
    // Fetch all conversion entries matching the filters
    const conversions = await Conversion.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() is good for performance when not modifying documents

    const totalConversions = await Conversion.countDocuments(query);

    // Since Conversion.userId stores googleId (string), we need to fetch user details manually
    const userGoogleIds = [...new Set(conversions.map(conv => conv.userId).filter(id => id != null))] as string[];
    
    let userMap = new Map<string, { email?: string; displayName: string }>();
    if (userGoogleIds.length > 0) {
        const users = await User.find({ googleId: { $in: userGoogleIds } }).select('googleId email displayName').lean();
        userMap = new Map(users.map(u => [u.googleId, { email: u.email, displayName: u.displayName }]));
    }

    const transformedData = conversions.map(conv => ({
        _id: conv._id, // This is Conversion document's _id
        value_cm: conv.value_cm,
        volume_l: conv.volume_l,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt, 
        userEmail: userMap.get(conv.userId as string)?.email || 'N/A', 
        userName: userMap.get(conv.userId as string)?.displayName || 'Utilisateur Inconnu',
        // originalUserIdFromConversion: conv.userId // For debugging if needed
    }));

    res.status(200).json({
      data: transformedData,
      currentPage: page,
      totalPages: Math.ceil(totalConversions / limit),
      totalItems: totalConversions,
    });
  } catch (error: any) {
    console.error('Error fetching global history:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'historique global.', error: error.message });
  }
};

// --- Delete Conversion Entry ---
export const deleteConversionEntry = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user as IUser | undefined; // Cast req.user
  const currentUserIdForCheck = currentUser?.googleId; // For ownership check, using Google ID

  const entryId = req.params.id;

  if (!currentUser || !currentUserIdForCheck) { // Ensure user and their googleId is present
    res.status(401).json({ message: 'Utilisateur non authentifié ou ID Google manquant pour la suppression.' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    res.status(400).json({ message: 'ID de l\'entrée de conversion invalide.' });
    return;
  }

  try {
    const conversionEntry = await Conversion.findById(entryId);
    if (!conversionEntry) {
      res.status(404).json({ message: 'Entrée de conversion non trouvée.' });
      return;
    }

    // Ownership check: Conversion.userId (which is googleId string) vs current user's googleId
    if (conversionEntry.userId !== currentUserIdForCheck) {
      console.warn(`User ${currentUserIdForCheck} (Google ID) attempt to delete entry ${entryId} owned by ${conversionEntry.userId} (Google ID)`);
      res.status(403).json({ message: 'Non autorisé à supprimer cette entrée (propriétaire différent).' });
      return;
    }

    await conversionEntry.deleteOne();
    console.log(`Conversion entry ${entryId} deleted by user ${currentUserIdForCheck} (Google ID)`);
    res.status(200).json({ message: 'Entrée de conversion supprimée avec succès.' });
  } catch (error: any) {
    console.error(`Error deleting conversion entry ${entryId} for user ${currentUserIdForCheck}:`, error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'entrée.', error: error.message });
  }
};