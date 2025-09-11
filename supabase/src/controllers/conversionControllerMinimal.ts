import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// --- Convert CM to Litres ---
export const convertCmToLitres = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;

  // Ensure user is authenticated
  if (!currentUser || !currentUser.id) {
    res.status(401).json({ message: 'User not authenticated or ID missing.' });
    return;
  }

  const userId = currentUser.id;
  const { value_cm } = req.body;

  if (value_cm === undefined || value_cm === null) {
    res.status(400).json({ message: 'Value in cm is required.' });
    return;
  }

  const cm = Number(value_cm);
  if (isNaN(cm) || cm < 0 || cm > 300) {
    res.status(400).json({ message: 'Invalid cm value or out of range (0-300 cm).' });
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
      res.status(404).json({ message: `No conversion found for ${cm} cm.` });
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
      res.status(500).json({ message: 'Server error during conversion.', error: insertError.message });
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
    res.status(500).json({ message: 'Server error during conversion.', error: error.message });
  }
};

// --- Get Conversion History ---
export const getConversionHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const accessorUser = req.user;
  const accessorUserIdForLog = accessorUser?.id || 'System';
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
    try {
      if (fromDateString) {
        // Convertir la date en format ISO
        const dateFrom = new Date(fromDateString);
        if (!isNaN(dateFrom.getTime())) {
          // Ajouter un jour pour inclure toute la journée
          const nextDay = new Date(dateFrom);
          nextDay.setDate(dateFrom.getDate() + 1);
          query = query.gte('created_at', dateFrom.toISOString()).lt('created_at', nextDay.toISOString());
        }
      }

      if (toDateString) {
        // Convertir la date en format ISO
        const dateTo = new Date(toDateString);
        if (!isNaN(dateTo.getTime())) {
          // Ajouter un jour pour inclure toute la journée
          const nextDay = new Date(dateTo);
          nextDay.setDate(dateTo.getDate() + 1);
          query = query.lte('created_at', dateTo.toISOString());
        }
      }
    } catch (error: any) {
      console.error('Error processing date filters:', error);
      // Ne pas filtrer si erreur de date
    }
  }

  // Add pagination
  query = query.range(offset, offset + limit - 1);

  try {
    // Fetch conversion entries
    const { data: conversions, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching global history:', error);
      res.status(500).json({ message: 'Server error while fetching global history.', error: error.message });
      return;
    }

    // Get total count
    const { count: totalConversions, error: countError } = await supabase
      .from('conversions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting conversions:', countError);
      res.status(500).json({ message: 'Server error while counting conversions.', error: countError.message });
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
      userName: conv.profiles?.name || 'Unknown User'
    }));

    res.status(200).json({
      data: transformedData,
      currentPage: page,
      totalPages: Math.ceil(totalConversions! / limit),
      totalItems: totalConversions!,
    });
  } catch (error: any) {
    console.error('Error fetching global history:', error);
    res.status(500).json({ message: 'Server error while fetching global history.', error: error.message });
  }
};

// --- Delete Conversion Entry ---
export const deleteConversionEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;
  const entryId = req.params.id;

  console.log(`DELETE /history/${entryId}: Attempted by user ID: ${currentUser?.id}`);

  if (!currentUser || !currentUser.id) {
    console.warn(`DELETE /history/${entryId}: Authorization FAILED. No authenticated user.`);
    res.status(403).json({ message: 'Unauthorized action. User not authenticated.' });
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
      res.status(404).json({ message: 'Conversion entry not found.' });
      return;
    }

    // Check if the user is the owner or admin
    const adminGoogleId = process.env.ADMIN_GOOGLE_ID;

    if (entry.user_id !== currentUser.id && (!adminGoogleId || currentUser.id !== adminGoogleId)) {
      console.warn(`DELETE /history/${entryId}: Authorization FAILED. User ${currentUser.id} is not the owner or admin.`);
      res.status(403).json({ message: 'Unauthorized action. You can only delete your own entries.' });
      return;
    }

    // Delete the entry
    const { error: deleteError } = await supabase
      .from('conversions')
      .delete()
      .eq('id', entryId);

    if (deleteError) {
      console.error(`Error deleting entry ${entryId}:`, deleteError);
      res.status(500).json({ message: 'Server error during deletion.', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: 'Entry deleted successfully.' });
  } catch (error: any) {
    console.error(`Error during delete operation for ${entryId}:`, error);
    res.status(500).json({ message: 'Server error during deletion.', error: error.message });
  }
};

// --- Bulk Delete Conversion Entries ---
export const bulkDeleteConversionEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const currentUser = req.user;
  const { ids } = req.body;
  const adminGoogleId = process.env.ADMIN_GOOGLE_ID;

  if (!currentUser || !currentUser.id) {
    console.warn("BULK DELETE: Authorization FAILED. No authenticated user.");
    res.status(403).json({ message: 'Unauthorized action. User not authenticated.' });
    return;
  }

  if (!adminGoogleId) {
    console.error("BULK DELETE: CRITICAL - ADMIN_GOOGLE_ID is not configured. Action blocked.");
    res.status(500).json({ message: "Server configuration error (admin privileges)." });
    return;
  }

  if (currentUser.id !== adminGoogleId) {
    console.warn(`BULK DELETE: Authorization FAILED. User ${currentUser.id} is NOT the admin (${adminGoogleId}).`);
    res.status(403).json({ message: 'Unauthorized action. Admin privileges required for bulk deletion.' });
    return;
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ message: 'List of IDs required for bulk deletion.' });
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
      res.status(500).json({ message: 'Server error during bulk deletion.', error: deleteError.message });
      return;
    }

    res.status(200).json({ message: `${ids.length} entry(s) deleted successfully by admin.` });
  } catch (error: any) {
    console.error('BULK DELETE: Error during bulk delete operation:', error);
    res.status(500).json({ message: 'Server error during bulk deletion.', error: error.message });
  }
};
