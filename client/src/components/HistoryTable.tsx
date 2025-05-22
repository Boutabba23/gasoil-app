import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import api from '../lib/api';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, Loader2, ListX } from 'lucide-react'; // Added ListX for bulk delete button
import {
  AlertDialog,
  AlertDialogAction,          // Added missing AlertDialog parts
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
          // Can be removed if managing open state manually like we are
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { cn } from '@/lib/utils';

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
  
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null); // For single delete spinner
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ConversionRecord | null>(null);

  // --- State for row selection ---
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  // --- End New State ---

  const itemsPerPage = 10;
  const isMounted = useRef(false);
  const prevSearchTermRef = useRef(searchTerm);
  const prevDateRangeRef = useRef(dateRange);

  const fetchHistory = useCallback(async (pageToFetch: number, currentSearchTerm?: string, currentDateRange?: DateRange) => {
    setIsLoading(true);
    setError(null);
    setSelectedRows({}); // Clear selections when data is re-fetched (new page, filters, etc.)
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
if (response.data.currentPage && response.data.currentPage !== pageToFetch && response.data.data.length > 0) {
        console.log(`HistoryTable: Backend returned page ${response.data.currentPage}, requested ${pageToFetch}. Updating.`);
        setCurrentPage(response.data.currentPage); // This might cause an extra fetch if not handled carefully.
                                                 // Simpler is to trust our controlled currentPage state.
    }
       if (response.data.data.length === 0 && pageToFetch > 1 && response.data.totalItems > 0) {
      // Check if the new target page makes sense given newTotalPages
      const newTotalPagesAfterPotentialDelete = Math.ceil(response.data.totalItems / itemsPerPage);
      setCurrentPage(Math.min(pageToFetch - 1, newTotalPagesAfterPotentialDelete, Math.max(1, newTotalPagesAfterPotentialDelete)));
    } else if (response.data.data.length === 0 && pageToFetch === 1 && response.data.totalItems > 0) {
        // This case means filters might be too strict for page 1 but items exist overall
        // Usually shouldn't happen if backend pagination is correct
        console.warn("HistoryTable: Page 1 is empty but totalItems > 0. Check filters or backend pagination.")
    }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors du chargement de l'historique.";
      setError(errorMessage);
      toast.error("Erreur Historique", { description: errorMessage, className: destructiveSonnerToastClasses });
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);


  useEffect(() => {
     console.log(`HistoryTable: Main fetch effect. Page: ${currentPage}, Search: '${searchTerm}', Range:`, dateRange);
     fetchHistory(currentPage, searchTerm, dateRange);
  }, [currentPage, searchTerm, dateRange, fetchHistory]);

  useEffect(() => {
    if (isMounted.current) { 
      let filtersHaveActuallyChanged = false;
      if (prevSearchTermRef.current !== searchTerm) {
        filtersHaveActuallyChanged = true;
        prevSearchTermRef.current = searchTerm;
      }
      // Simplified dateRange change detection (can be improved for object reference vs value)
         if (JSON.stringify(prevDateRangeRef.current) !== JSON.stringify(dateRange)) {
             filtersHaveActuallyChanged = true;
             prevDateRangeRef.current = dateRange;
         }
      const prevFromStr = prevDateRangeRef.current?.from ? format(prevDateRangeRef.current.from, 'yyyy-MM-dd') : "";
      const currentFromStr = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : "";
      const prevToStr = prevDateRangeRef.current?.to ? format(prevDateRangeRef.current.to, 'yyyy-MM-dd') : "";
      const currentToStr = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : "";
      if (prevFromStr !== currentFromStr || prevToStr !== currentToStr) {
          filtersHaveActuallyChanged = true;
          prevDateRangeRef.current = dateRange;
      }
      if (filtersHaveActuallyChanged && currentPage !== 1) setCurrentPage(1);
    } else {
      isMounted.current = true;
      prevSearchTermRef.current = searchTerm;
      prevDateRangeRef.current = dateRange;
    }
  }, [searchTerm, dateRange, currentPage]);


  const handleSelectRow = (rowId: string) => {
    setSelectedRows(prev => ({ ...prev, [rowId]: !prev[rowId] }));
  };

  const selectedRowIds = useMemo(() => Object.keys(selectedRows).filter(id => selectedRows[id]), [selectedRows]);

  const isAllOnPageSelected = useMemo(() => {
    if (history.length === 0) return false;
    return history.every(row => selectedRows[row._id]);
  }, [history, selectedRows]);

  const handleSelectAllRowsOnPage = () => {
    const allCurrentPageIds = history.map(row => row._id);
    const newSelectedState = !isAllOnPageSelected;
    const newSelectedRows = { ...selectedRows };
    allCurrentPageIds.forEach(id => { newSelectedRows[id] = newSelectedState; });
    setSelectedRows(newSelectedRows);
  };

  const handleBulkDeleteClick = () => {
    if (selectedRowIds.length === 0) {
      toast.info("Aucune Sélection", { description: "Veuillez sélectionner au moins une entrée à supprimer." });
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      const response = await api.post('/data/history/bulk-delete', { ids: selectedRowIds });
      toast.success("Suppressions Réussies", {
        description: response.data.message || `${selectedRowIds.length} entrée(s) supprimée(s).`,
        className: successSonnerToastClasses,
      });
      // Check if the current page might become empty or out of bounds
      const newTotalItems = totalItems - selectedRowIds.length;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage);
      setSelectedRows({});
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages); // This will trigger fetchHistory
      } else if (newTotalItems === 0 && currentPage > 1) {
        setCurrentPage(1); // Go to first page if all items are gone
      }
      else {
        fetchHistory(currentPage, searchTerm, dateRange); // Refetch current page
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la suppression groupée.";
      toast.error("Erreur de Suppression", { description: errorMessage, className: destructiveSonnerToastClasses });
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleDeleteClick = (record: ConversionRecord) => {
    setItemToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => { 
    if (!itemToDelete) return;
    setIsDeletingId(itemToDelete._id);
    try {
      await api.delete(`/data/history/${itemToDelete._id}`);
      toast.success("Suppression Réussie", { /* ... */ className: successSonnerToastClasses });
      if (history.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchHistory(currentPage, searchTerm, dateRange);
      }
    } catch (err: any) { /* ... */ } 
    finally { /* ... */ }
  };
  
  if (isLoading && totalItems === 0 && currentPage === 1) { /* ... Initial loading JSX ... */ }
  if (error && totalItems === 0) { /* ... Error JSX ... */ }
    const showPagination = totalPages > 1 && !isLoading && totalItems > 0;

  return (
    <div className="space-y-6">
      {selectedRowIds.length > 0 && (
        <div className={cn(
            "flex items-center justify-start gap-3 py-3 px-4 sm:px-6 border-b rounded-t-lg",
            "bg-muted/80 dark:bg-slate-800/80 backdrop-blur-sm",
            // If you want this bar to be sticky as well:
            // "sticky top-[CALCULATED_TOP_OFFSET_BELOW_FILTERS] z-5" 
            // The calculated top offset is tricky as mentioned before. For now, non-sticky.
          )}
        >
          <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick} disabled={isBulkDeleting}>
            {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ListX className="mr-2 h-4 w-4" />}
            Supprimer ({selectedRowIds.length})
          </Button>
           <Button variant="ghost" size="sm" onClick={() => setSelectedRows({})} disabled={isBulkDeleting}>
             Désélectionner
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            {selectedRowIds.length} élément(s) sélectionné(s)
          </span>
        </div>
      )}

      <Table>
        {!isLoading && totalItems === 0 && ( <TableCaption> {/* ... Empty state ... */} </TableCaption> )}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] px-2 text-center">
              <Checkbox
                checked={isAllOnPageSelected || (selectedRowIds.length > 0 && history.length > 0 && history.length === selectedRowIds.filter(id => history.find(h => h._id === id)).length)}
                indeterminate={selectedRowIds.length > 0 && !isAllOnPageSelected && history.length > 0}
                onCheckedChange={handleSelectAllRowsOnPage}
                aria-label="Sélectionner toutes les lignes sur cette page"
                disabled={history.length === 0 || isLoading}
              />
            </TableHead>
            <TableHead className="w-[130px]">Date</TableHead>
            <TableHead className="w-[100px]">Heure</TableHead>
            <TableHead>Utilisateur</TableHead>
            <TableHead className="text-right w-[90px]">Jauge (cm)</TableHead>
            <TableHead className="text-right w-[110px]">Volume (L)</TableHead>
            <TableHead className="text-center w-[90px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && history.length > 0 }
          {!isLoading && history.map((record) => (
            <TableRow key={record._id} data-state={selectedRows[record._id] ? "selected" : ""} className={cn(selectedRows[record._id] && "bg-muted/50 dark:bg-slate-800/50 hover:bg-muted dark:hover:bg-slate-800")}>
              <TableCell className="px-2 text-center">
                <Checkbox checked={!!selectedRows[record._id]} onCheckedChange={() => handleSelectRow(record._id)} aria-label={`Sélectionner la ligne`} />
              </TableCell>
              <TableCell>{format(new Date(record.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
              <TableCell>{format(new Date(record.createdAt), 'HH:mm:ss', { locale: fr })}</TableCell>
              <TableCell className="text-xs min-w-[150px] max-w-[250px] truncate"> {/* Width control for user col */}
                {record.userName && record.userName !== 'Utilisateur Inconnu' ? (<><div className="font-medium truncate" title={record.userName}>{record.userName}</div>{record.userEmail && record.userEmail !== 'N/A' && (<div className="text-muted-foreground truncate" title={record.userEmail}>{record.userEmail}</div>)}</>) : record.userEmail && record.userEmail !== 'N/A' ? (record.userEmail) : (<span className="italic text-muted-foreground">Non disponible</span>)}
              </TableCell>
              <TableCell className="text-right">{record.value_cm.toFixed(1)}</TableCell>
              <TableCell className="text-right">{record.volume_l.toFixed(2)}</TableCell>
              <TableCell className="text-center">
                <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(record)} disabled={isDeletingId === record._id} className="text-destructive hover:text-destructive hover:bg-destructive/10" title="Supprimer">
                    {isDeletingId === record._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
 {/* PAGINATION CONTROLS - using the pre-calculated showPagination */}
      {showPagination && (
        <div className="flex justify-center items-center space-x-2 mt-6 pt-4 border-t dark:border-slate-800">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
            size="sm"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} ({totalItems} éléments)
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
            size="sm"
          >
            Suivant
          </Button>
        </div>
      )}
      {/* ... AlertDialogs ... */}
    
      {totalPages > 1 && !isLoading && totalItems > 0 }
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'entrée {itemToDelete && `pour ${itemToDelete.value_cm.toFixed(1)} cm `}
              {itemToDelete && `du ${format(new Date(itemToDelete.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })} `}
              sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel /* ... */>Annuler</AlertDialogCancel><AlertDialogAction /* ... */>Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showBulkDeleteConfirm} onOpenChange={setShowBulkDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la Suppression Groupée</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer les {selectedRowIds.length} entrée(s) sélectionnée(s)? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isBulkDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Supprimer la Sélection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoryTable;