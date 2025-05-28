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
    const adminGoogleIdFromEnv = process.env.ADMIN_GOOGLE_ID;

  if (!adminGoogleIdFromEnv) {
console.error("BULK DELETE: CRITICAL - ADMIN_GOOGLE_ID is not configured. Action blocked.");
    res.status(500).json({ message: "Erreur de configuration serveur (privilèges administrateur)." });
       return;
  }
if (!currentUser || !currentUser.googleId || currentUser.googleId !== adminGoogleIdFromEnv) {
        res.status(403).json({ message: 'Action non autorisée. Privilèges administrateur requis pour la suppression groupée.' });
        return;
    }
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'Liste d\'IDs requise pour la suppression groupée.' });
    return;
  }
  const validObjectIds: mongoose.Types.ObjectId[] = [];

  // Validate all IDs
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log(`BULK DELETE (Admin): Error - Invalid ObjectId format in array: ${id}`);

      res.status(400).json({ message: `ID de conversion invalide trouvé: ${id}` });
      return;
    }
        validObjectIds.push(new mongoose.Types.ObjectId(id)); // Convert string IDs to ObjectIds

  }
  console.log("BULK DELETE (Admin): All provided IDs validated. Count:", validObjectIds.length);

try {
    // Admin deletes the entries specified by their _id. No further ownership check needed here
    // because the user has already been verified as admin.
    const deleteResult = await Conversion.deleteMany({ _id: { $in: validObjectIds } });
    console.log("BULK DELETE (Admin): Mongoose deleteMany result:", deleteResult);

    if (deleteResult.deletedCount > 0) {
      res.status(200).json({ message: `${deleteResult.deletedCount} entrée(s) supprimée(s) avec succès par l'administrateur.` });
    } else {
      // This means none of the validObjectIds provided actually existed in the database.
      console.log("BULK DELETE (Admin): Mongoose deleteMany reported 0 documents deleted (IDs not found).");
      res.status(404).json({ message: 'Aucune des entrées spécifiées n\'a été trouvée pour la suppression (elles pourraient avoir déjà été supprimées).' });
    }
  } catch (error: any) {
    console.error('BULK DELETE (Admin): Error during database operation:', error);
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
// server/src/controllers/conversionController.ts
// ... (imports IUser, Request, Response, mongoose, Conversion model)

export const deleteConversionEntry = async (req: Request, res: Response): Promise<void> => {
  const currentUser = req.user as IUser | undefined; // Cast from protect middleware
  const entryId = req.params.id;
  
   const adminGoogleIdFromEnv = process.env.ADMIN_GOOGLE_ID;

  console.log(`DELETE /history/${entryId}: Attempted by user Google ID: ${currentUser?.googleId}. Admin ID configured: ${adminGoogleIdFromEnv}`);

 // 1. Is Admin ID configured in .env?
  if (!adminGoogleIdFromEnv) {
    console.error("SECURITY ALERT: ADMIN_GOOGLE_ID is not configured on the server. Delete actions are blocked.");
    res.status(500).json({ message: "Erreur de configuration serveur critique. Contactez l'administrateur." });
    return;
  }


    // 2. Is the current user the configured Admin?
  if (!currentUser || !currentUser.googleId || currentUser.googleId !== adminGoogleIdFromEnv) {
    console.warn(`DELETE /history/${entryId}: Authorization FAILED. Requester ${currentUser?.googleId} is NOT the admin (${adminGoogleIdFromEnv}).`);
    // If you want a generic message for non-admins:
    res.status(403).json({ message: 'Action non autorisée. Privilèges administrateur requis.' });
    // If you want the specific "propriétaire différent" when NOT admin AND NOT owner (more complex):
    // This would require fetching the entry first to check its owner, which is not needed if only admin deletes.
    return;
  }



// 3. If execution reaches here, user IS the Admin. Proceed with deletion.
  console.log(`DELETE /history/${entryId}: User ${currentUser.googleId} IS ADMIN. Proceeding with deletion.`);

  if (!mongoose.Types.ObjectId.isValid(entryId)) {
    console.log(`DELETE /history/${entryId}: Invalid ObjectId format for entryId.`);
    res.status(400).json({ message: 'ID de l\'entrée de conversion invalide.' });
    return;
  }


    try {
    const result = await Conversion.deleteOne({ _id: entryId }); // Admin deletes by _id directly

    if (result.deletedCount === 0) {
      console.log(`DELETE /history/${entryId}: Conversion entry not found by admin.`);
      res.status(404).json({ message: 'Entrée de conversion non trouvée.' });
      return;
    }

    console.log(`DELETE /history/${entryId}: Entry successfully deleted by ADMIN ${currentUser.googleId}.`);
    res.status(200).json({ message: 'Entrée de conversion supprimée avec succès par l\'administrateur.' });

  } catch (error: any) {
    console.error(`DELETE /history/${entryId}: Error during deletion by admin ${currentUser.googleId}:`, error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'entrée.', error: error.message });
  }
};
