import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// --- Convert CM to Litres ---
export const convertCmToLitres = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;

  // Ensure user is authenticated
  if (!currentUser || !currentUser.id) {
    res.status(401).json({ message: 'Utilisateur non authentifié ou ID manquant.' });
    return;
  }

  const userId = currentUser.id;
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
    // Get conversion table entry from Supabase
    const { data: entry, error } = await supabase
      .from('conversion_table')
      .select('litres')
      .eq('cm', cm)
      .single();

    if (error || !entry) {
      res.status(404).json({ message: `Aucune conversion trouvée pour ${cm} cm.` });
      return;
    }

    // Insert new conversion into Supabase
    const { data: newConversion, error: insertError } = await supabase
      .from('conversions')
      .insert({
        user_id: userId,
        value_cm: cm,
        volume_l: entry.litres
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error during conversion:', insertError);
      res.status(500).json({ message: 'Erreur serveur lors de la conversion.', error: insertError.message });
      return;
    }

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

// --- Get Conversion History ---
export const getConversionHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const accessorUser = req.user;
  const accessorUserIdForLog = accessorUser?.id || 'Système';
  console.log(`User/Accessor ${accessorUserIdForLog} is accessing global conversion history.`);

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('conversions')
    .select(`
      id,
      value_cm,
      volume_l,
      created_at,
      profiles (
        id,
        email,
        name,
        avatar_url
      )
    `);

  // Search Term Filter
  if (req.query.search) {
    const searchTerm = req.query.search as string;
    const searchNumber = parseFloat(searchTerm);
    if (!isNaN(searchNumber)) {
      query = query.or(`value_cm.eq.${searchNumber},volume_l.eq.${searchNumber}`);
    }
  }

  // Date Range Filter
  const fromDateString = req.query.from as string | undefined;
  const toDateString = req.query.to as string | undefined;

  if (fromDateString || toDateString) {
    if (fromDateString) {
      const dateFrom = new Date(fromDateString);
      dateFrom.setUTCHours(0, 0, 0, 0);
      if (!isNaN(dateFrom.getTime())) {
        query = query.gte('created_at', dateFrom.toISOString());
      }
    }

    if (toDateString) {
      const dateTo = new Date(toDateString);
      dateTo.setUTCHours(23, 59, 59, 999);
      if (!isNaN(dateTo.getTime())) {
        query = query.lte('created_at', dateTo.toISOString());
      }
    }
  }

  // Add pagination
  query = query.range(offset, offset + limit - 1);

  try {
    // Fetch conversion entries
    const { data: conversions, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching global history:', error);
      res.status(500).json({ message: 'Erreur serveur lors de la récupération de l'historique global.', error: error.message });
      return;
    }

    // Get total count
    const { count: totalConversions, error: countError } = await supabase
      .from('conversions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting conversions:', countError);
      res.status(500).json({ message: 'Erreur serveur lors du comptage des conversions.', error: countError.message });
      return;
    }

    // Transform the data
    const transformedData = conversions.map(conv => ({
      _id: conv.id,
      value_cm: conv.value_cm,
      volume_l: conv.volume_l,
      createdAt: conv.created_at,
      updatedAt: conv.created_at,
      userEmail: conv.profiles?.email || 'N/A',
      userName: conv.profiles?.name || 'Utilisateur Inconnu'
    }));

    res.status(200).json({
      data: transformedData,
      currentPage: page,
      totalPages: Math.ceil(totalConversions! / limit),
      totalItems: totalConversions!,
    });
  } catch (error: any) {
    console.error('Error fetching global history:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l'historique global.', error: error.message });
  }
};

// --- Delete Conversion Entry ---
export const deleteConversionEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;
  const entryId = req.params.id;

  console.log(`DELETE /history/${entryId}: Attempted by user ID: ${currentUser?.id}`);

  if (!currentUser || !currentUser.id) {
    console.warn(`DELETE /history/${entryId}: Authorization FAILED. No authenticated user.`);
    res.status(403).json({ message: 'Action non autorisée. Utilisateur non authentifié.' });
    return;
  }

  try {
    // Check if the entry exists and belongs to the user
    const { data: entry, error: fetchError } = await supabase
      .from('conversions')
      .select('id, user_id')
      .eq('id', entryId)
      .single();

    if (fetchError || !entry) {
      console.log(`DELETE /history/${entryId}: Entry not found.`);
      res.status(404).json({ message: 'Entrée de conversion non trouvée.' });
      return;
    }

    // Check if the user is the owner or admin
    const adminGoogleId = process.env.ADMIN_GOOGLE_ID;

    if (entry.user_id !== currentUser.id && (!adminGoogleId || currentUser.id !== adminGoogleId)) {
      console.warn(`DELETE /history/${entryId}: Authorization FAILED. User ${currentUser.id} is not the owner or admin.`);
      res.status(403).json({ message: 'Action non autorisée. Vous ne pouvez supprimer que vos propres entrées.' });
      return;
    }

    // Delete the entry
    const { error: deleteError } = await supabase
      .from('conversions')
      .delete()
      .eq('id', entryId);

    if (deleteError) {
      console.error(`Error deleting entry ${entryId}:`, deleteError);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression.', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: 'Entrée supprimée avec succès.' });
  } catch (error: any) {
    console.error(`Error during delete operation for ${entryId}:`, error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.', error: error.message });
  }
};

// --- Bulk Delete Conversion Entries ---
export const bulkDeleteConversionEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;
  const { ids } = req.body;
  const adminGoogleId = process.env.ADMIN_GOOGLE_ID;

  if (!currentUser || !currentUser.id) {
    console.warn("BULK DELETE: Authorization FAILED. No authenticated user.");
    res.status(403).json({ message: 'Action non autorisée. Utilisateur non authentifié.' });
    return;
  }

  if (!adminGoogleId) {
    console.error("BULK DELETE: CRITICAL - ADMIN_GOOGLE_ID is not configured. Action blocked.");
    res.status(500).json({ message: "Erreur de configuration serveur (privilèges administrateur)." });
    return;
  }

  if (currentUser.id !== adminGoogleId) {
    console.warn(`BULK DELETE: Authorization FAILED. User ${currentUser.id} is NOT the admin (${adminGoogleId}).`);
    res.status(403).json({ message: 'Action non autorisée. Privilèges administrateur requis pour la suppression groupée.' });
    return;
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'Liste d'IDs requise pour la suppression groupée.' });
    return;
  }

  try {
    // Admin deletes the entries specified by their IDs
    const { error: deleteError } = await supabaseAdmin
      .from('conversions')
      .delete()
      .in('id', ids);

    if (deleteError) {
      console.error('BULK DELETE: Error during bulk delete operation:', deleteError);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression groupée.', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: `${ids.length} entrée(s) supprimée(s) avec succès par l'administrateur.` });
  } catch (error: any) {
    console.error('BULK DELETE: Error during bulk delete operation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression groupée.', error: error.message });
  }
};
