import React, { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption, // Optional: for "No data" message
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, AlertTriangle, Loader2, Frown } from 'lucide-react'; // Icons

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  //AlertDialogTrigger, // Keep if triggering directly, or manage open state
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker"; // Type for dateRange prop

// Define or import Sonner toast variant classes
const successSonnerToastClasses = "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/60 dark:border-green-700 dark:text-green-200 rounded-lg shadow-md p-4";
const destructiveSonnerToastClasses = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";

interface ConversionRecord {
  _id: string;
  value_cm: number;
  volume_l: number;
  userEmail?: string; 
     userName?: string; 

  createdAt: string;
}

interface PaginatedResponse {
  data: ConversionRecord[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

interface HistoryTableProps {
  searchTerm?: string;
  dateRange?: DateRange | undefined;
  // key prop from parent can also trigger re-fetch if filters change there
}

const HistoryTable: React.FC<HistoryTableProps> = ({ searchTerm, dateRange }) => {
  
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // Store ID of item being deleted for spinner
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Keep track of total items

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ConversionRecord | null>(null);

  const itemsPerPage = 10;

  const fetchHistory = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);
    console.log(`HistoryTable: Fetching history for page: ${pageToFetch}, search: '${searchTerm}', dateRange:`, dateRange);

    try {
      const params = new URLSearchParams({
        page: pageToFetch.toString(),
        limit: itemsPerPage.toString(),
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      if (dateRange?.from) {
        // Format date to YYYY-MM-DD for backend compatibility, ensure it's UTC based
        params.append('from', format(dateRange.from, 'yyyy-MM-dd'));
      }
      if (dateRange?.to) {
        params.append('to', format(dateRange.to, 'yyyy-MM-dd'));
      }
       const apiUrl = `/data/history?${params.toString()}`;
      console.log("HistoryTable: Calling API:", apiUrl);
      const response = await api.get<PaginatedResponse>(`/data/history?${params.toString()}`);
      console.log("HistoryTable: Fetched data items:", response.data.data.slice(0,2)); // Log first few items to check
      
      setHistory(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);

      if (response.data.data.length === 0 && pageToFetch > 1 && response.data.totalItems > 0) {
        setCurrentPage(pageToFetch - 1); // This will re-trigger fetch due to useEffect dependency on currentPage
      }
    } catch (err: any) {
       console.error("HistoryTable: Error fetching history - raw error object:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("HistoryTable: Error response data:", err.response.data);
        console.error("HistoryTable: Error response status:", err.response.status);
        console.error("HistoryTable: Error response headers:", err.response.headers);
        const errorMessage = err.response.data?.message || `Erreur serveur (${err.response.status})`;
        setError(errorMessage);
        toast.error("Erreur de Chargement de l'Historique", { description: errorMessage, className: destructiveSonnerToastClasses });
      } else if (err.request) {
        // The request was made but no response was received
        console.error("HistoryTable: No response received for request:", err.request);
        const errorMessage = "Impossible de joindre le serveur. Veuillez vérifier votre connexion.";
        setError(errorMessage);
        toast.error("Erreur Réseau", { description: errorMessage, className: destructiveSonnerToastClasses });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("HistoryTable: Error setting up request:", err.message);
        const errorMessage = `Erreur inattendue: ${err.message}`;
        setError(errorMessage);
        toast.error("Erreur Inattendue", { description: errorMessage, className: destructiveSonnerToastClasses });
      }
    } finally {
      setIsLoading(false);
    }
  }
 
  , [searchTerm, dateRange, itemsPerPage]); // currentPage is handled by its own useEffect trigger

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, fetchHistory]); // fetchHistory reference changes if searchTerm or dateRange changes

  useEffect(() => {
      // When searchTerm or dateRange props change, reset to page 1
      console.log("HistoryTable: Filters (searchTerm or dateRange) changed, resetting to page 1.");
      setCurrentPage(1); 
      // This will trigger the above useEffect to fetch data for page 1 with new filters.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateRange]); // Only dependent on the filter props themselves
  // --- END ADDED USEEFFECT ---
  const handleDeleteClick = (record: ConversionRecord) => {
    setItemToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeletingId(itemToDelete._id); // Show spinner on the specific row's button
    try {
      await api.delete(`/data/history/${itemToDelete._id}`);
      toast.success("Suppression Réussie", {
        description: `L'entrée du ${format(new Date(itemToDelete.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })} a été supprimée.`,
        className: successSonnerToastClasses,
      });
      // Refetch history for the current page
      // If it was the last item on a page (and not page 1), the fetchHistory logic will handle going to prev page.
      // Or, to be more precise after deletion:
      if (history.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1); // This will trigger fetchHistory
      } else {
        fetchHistory(currentPage); // Re-fetch current page
      }
    } catch (err: any) {
      console.error("Error deleting history entry:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
      toast.error("Erreur de Suppression", { description: errorMessage, className: destructiveSonnerToastClasses });
    } finally {
      setIsDeletingId(null);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-3 text-muted-foreground">Chargement de l'historique...</p>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <p className="text-destructive font-medium">Erreur de chargement</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => fetchHistory(currentPage)} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Table>
        {!isLoading && history.length === 0 && (
          <TableCaption className="py-10">
            <div className="flex flex-col items-center gap-2">
                <Frown className="h-10 w-10 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Aucun enregistrement trouvé.</p>
                { (searchTerm || dateRange?.from) && 
                  <p className="text-sm text-muted-foreground">Essayez d'ajuster vos filtres.</p>
                }
            </div>
          </TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[120px]">Heure</TableHead>
                         <TableHead className="w-[180px]">Utilisateur</TableHead> {/* 👇 NEW COLUMN */}

            <TableHead className="text-right w-[100px]">Jauge (cm)</TableHead>
            <TableHead className="text-right w-[120px]">Volume (L)</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && history.length > 0 && ( // Show loading overlay on table if refreshing
            <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
            </TableRow>
          )}
          {!isLoading && history.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{format(new Date(record.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
              <TableCell>{format(new Date(record.createdAt), 'HH:mm:ss', { locale: fr })}</TableCell>
               <TableCell className="text-xs">
                 {record.userName && record.userName !== 'Utilisateur Inconnu' ? (
                     <>
                         <div className="font-medium">{record.userName}</div>
                         {record.userEmail && record.userEmail !== 'N/A' && (
                             <div className="text-muted-foreground">{record.userEmail}</div>
                         )}
                     </>
                 ) : record.userEmail && record.userEmail !== 'N/A' ? (
                     record.userEmail
                 ) : (
                     <span className="italic text-muted-foreground">Non disponible</span>
                 )}
               </TableCell>
              <TableCell className="text-right">{record.value_cm.toFixed(1)}</TableCell>
              <TableCell className="text-right">{record.volume_l.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(record)}
                  disabled={isDeletingId === record._id}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {isDeletingId === record._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only">Supprimer</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && !isLoading && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            variant="outline"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} ({totalItems} éléments)
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'entrée pour{' '}
              {itemToDelete && `${itemToDelete.value_cm.toFixed(1)} cm (${itemToDelete.volume_l.toFixed(2)} L)`}
              {' '}du{' '}
              {itemToDelete && format(new Date(itemToDelete.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              {' '}sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)} disabled={!!isDeletingId}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!!isDeletingId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoryTable;