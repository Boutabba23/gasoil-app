import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, AlertTriangle, Loader2, Frown } from 'lucide-react';
import {
  AlertDialog,

} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

const successSonnerToastClasses = "bg-green-50 border-green-400 text-green-800 dark:bg-green-900/60 dark:border-green-700 dark:text-green-200 rounded-lg shadow-md p-4";
const destructiveSonnerToastClasses = "bg-red-50 border-red-400 text-red-800 dark:bg-red-900/60 dark:border-red-700 dark:text-red-200 rounded-lg shadow-md p-4";

interface ConversionRecord {
  _id: string;
  value_cm: number;
  volume_l: number;
  createdAt: string;
  userEmail?: string;
  userName?: string;
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
}

const HistoryTable: React.FC<HistoryTableProps> = ({ searchTerm, dateRange }) => {
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ConversionRecord | null>(null);

  const itemsPerPage = 10;
  const isMounted = useRef(false); // To prevent initial double fetch on filter change effect

  const prevSearchTermRef = useRef(searchTerm);
  const prevDateRangeRef = useRef(dateRange);

  const fetchHistory = useCallback(async (pageToFetch: number, currentSearchTerm?: string, currentDateRange?: DateRange) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pageToFetch.toString(), limit: itemsPerPage.toString() });
      if (currentSearchTerm) params.append('search', currentSearchTerm);
      if (currentDateRange?.from) params.append('from', format(currentDateRange.from, 'yyyy-MM-dd'));
      if (currentDateRange?.to) params.append('to', format(currentDateRange.to, 'yyyy-MM-dd'));
      
      const apiUrl = `/data/history?${params.toString()}`;
      const response = await api.get<PaginatedResponse>(apiUrl);
      
      setHistory(response.data.data);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
      // It's usually better to let the page number from URL params dictate, but ensure consistency.
      // If backend indicates a different current page due to constraints, update.
      if(response.data.currentPage !== pageToFetch && response.data.data.length > 0) {
        // This can happen if pageToFetch was out of bounds. Backend sends valid current page.
        // setCurrentPage(response.data.currentPage); // Careful: This could cause another fetch. Only if necessary.
      }


      if (response.data.data.length === 0 && pageToFetch > 1 && response.data.totalItems > 0) {
        setCurrentPage(prev => Math.max(1, prev - 1)); 
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors du chargement de l'historique.";
      setError(errorMessage);
      toast.error("Erreur Historique", { description: errorMessage, className: destructiveSonnerToastClasses });
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  // Effect for initial mount and when critical dependencies for fetching change.
  useEffect(() => {
    fetchHistory(currentPage, searchTerm, dateRange);
  }, [currentPage, searchTerm, dateRange, fetchHistory]);

  // Effect to reset to page 1 when filter props (searchTerm or dateRange) ACTUALLY change from parent.
  useEffect(() => {
    // This effect runs after the initial mount too.
    // Use isMounted ref to only reset page if filters change *after* initial mount.
    if (isMounted.current) { 
      let filtersHaveActuallyChanged = false;

      if (prevSearchTermRef.current !== searchTerm) {
        filtersHaveActuallyChanged = true;
        prevSearchTermRef.current = searchTerm;
      }

      const prevFromStr = prevDateRangeRef.current?.from ? format(prevDateRangeRef.current.from, 'yyyy-MM-dd') : "";
      const currentFromStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : "";
      const prevToStr = prevDateRangeRef.current?.to ? format(prevDateRangeRef.current.to, 'yyyy-MM-dd') : "";
      const currentToStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : "";

      if (prevFromStr !== currentFromStr || prevToStr !== currentToStr) {
          filtersHaveActuallyChanged = true;
          prevDateRangeRef.current = dateRange;
      }

      if (filtersHaveActuallyChanged) {
        if (currentPage !== 1) {
          setCurrentPage(1);
        } 
        // If already on page 1, the main useEffect [currentPage, searchTerm, dateRange, fetchHistory]
        // will pick up the new searchTerm/dateRange and refetch.
      }
    } else {
      // On first mount, set isMounted to true. Update refs with initial prop values.
      isMounted.current = true;
      prevSearchTermRef.current = searchTerm;
      prevDateRangeRef.current = dateRange;
    }
  }, [searchTerm, dateRange, currentPage]); // Monitor currentPage here too


  const handleDeleteClick = (record: ConversionRecord) => {
    setItemToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => { 
    if (!itemToDelete) return;
    setIsDeletingId(itemToDelete._id);
    try {
      await api.delete(`/data/history/${itemToDelete._id}`);
      toast.success("Suppression Réussie", {
        description: `L'entrée du ${format(new Date(itemToDelete.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })} a été supprimée.`,
        className: successSonnerToastClasses,
      });
      // Re-fetch current page with current filters, or go to previous page if current becomes empty
      if (history.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1); // Will trigger fetch via main useEffect
      } else {
        fetchHistory(currentPage, searchTerm, dateRange); // Call with current filters
      }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Erreur lors de la suppression.";
        toast.error("Erreur de Suppression", { description: errorMessage, className: destructiveSonnerToastClasses });
    } finally {
        setIsDeletingId(null);
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    }
  };
  
  if (isLoading && totalItems === 0 && currentPage === 1) { // More specific initial loading
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-3 text-muted-foreground">Chargement de l'historique...</p>
      </div>
    );
  }

  if (error && totalItems === 0) { // Show error if no items could be loaded due to error
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <p className="text-destructive font-medium">Erreur de chargement</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => fetchHistory(currentPage, searchTerm, dateRange)} variant="outline" className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Table>
        {!isLoading && totalItems === 0 && ( /* Now correctly checking totalItems from API */
          <TableCaption className="py-10">
            <div className="flex flex-col items-center gap-2">
                <Frown className="h-10 w-10 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">Aucun enregistrement trouvé.</p>
                { (searchTerm || dateRange?.from || dateRange?.to) && 
                  <p className="text-sm text-muted-foreground">Essayez d'ajuster ou de réinitialiser vos filtres.</p>
                }
            </div>
          </TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[120px]">Heure</TableHead>
            <TableHead className="w-[180px]">Utilisateur</TableHead>
            <TableHead className="text-right w-[100px]">Jauge (cm)</TableHead>
            <TableHead className="text-right w-[120px]">Volume (L)</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && history.length > 0 && ( 
            <TableRow><TableCell colSpan={6} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /><span className="ml-2 text-muted-foreground">Mise à jour...</span></TableCell></TableRow>
          )}
          {!isLoading && history.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{format(new Date(record.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
              <TableCell>{format(new Date(record.createdAt), 'HH:mm:ss', { locale: fr })}</TableCell>
              <TableCell className="text-xs">
                {record.userName && record.userName !== 'Utilisateur Inconnu' ? (<><div className="font-medium">{record.userName}</div>{record.userEmail && record.userEmail !== 'N/A' && (<div className="text-muted-foreground">{record.userEmail}</div>)}</>) : record.userEmail && record.userEmail !== 'N/A' ? (record.userEmail) : (<span className="italic text-muted-foreground">Non disponible</span>)}
              </TableCell>
              <TableCell className="text-right">{record.value_cm.toFixed(1)}</TableCell>
              <TableCell className="text-right">{record.volume_l.toFixed(2)}</TableCell>
              <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => handleDeleteClick(record)} disabled={isDeletingId === record._id} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Supprimer"><Trash2 className="h-4 w-4" /></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalPages > 1 && !isLoading && totalItems > 0 && ( <div className="flex justify-center items-center space-x-2 mt-6"> <Button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} variant="outline">Précédent</Button> <span className="text-sm text-muted-foreground">Page {currentPage} sur {totalPages} ({totalItems} éléments)</span> <Button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} variant="outline">Suivant</Button> </div> )}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>{/* ... AlertDialog JSX ... */}</AlertDialog>
    </div>
  );
};
export default HistoryTable;