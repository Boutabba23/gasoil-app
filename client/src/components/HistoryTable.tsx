import React, { useEffect, useState, useCallback } from 'react';
import api from '../lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns'; // Pour formater les dates
import { fr } from 'date-fns/locale';   // Pour le format français

interface ConversionRecord {
  _id: string;
  value_cm: number;
  volume_l: number;
  createdAt: string; // Date ISO String
}

interface PaginatedResponse {
  data: ConversionRecord[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const HistoryTable: React.FC = () => {
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchHistory = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<PaginatedResponse>(`/data/history?page=${page}&limit=${itemsPerPage}`);
      setHistory(response.data.data);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors du chargement de l'historique.");
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]); // itemsPerPage est constant, mais on le met par bonne pratique

  useEffect(() => {
    fetchHistory(currentPage);
  }, [fetchHistory, currentPage]); // Re-fetch si fetchHistory ou currentPage change

  if (isLoading && history.length === 0) { // Afficher chargement initial seulement
    return <p>Chargement de l'historique...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (history.length === 0 && !isLoading) {
    return <p>Aucun prélèvement enregistré pour le moment.</p>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Heure</TableHead>
            <TableHead className="text-right">Valeur (cm)</TableHead>
            <TableHead className="text-right">Volume (L)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((record) => (
            <TableRow key={record._id}>
              <TableCell>{format(new Date(record.createdAt), 'dd/MM/yyyy', { locale: fr })}</TableCell>
              <TableCell>{format(new Date(record.createdAt), 'HH:mm:ss', { locale: fr })}</TableCell>
              <TableCell className="text-right">{record.value_cm.toFixed(1)}</TableCell> {/* Ajustez le nombre de décimales */}
              <TableCell className="text-right">{record.volume_l.toFixed(2)}</TableCell> {/* Ajustez le nombre de décimales */}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
            variant="outline"
          >
            Précédent
          </Button>
          <span className="text-sm">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default HistoryTable;