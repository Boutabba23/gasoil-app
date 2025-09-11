import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface DataExportProps {
  data: Array<{
    _id: string;
    value_cm: number;
    volume_l: number;
    createdAt: string;
    userEmail?: string;
    userName?: string;
  }>;
  filename?: string;
}

const DataExport: React.FC<DataExportProps> = ({ data, filename = "export-gasoil" }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      // Define CSV headers
      const headers = [
        "ID",
        "Date",
        "Valeur (cm)",
        "Volume (L)",
        "Email Utilisateur",
        "Nom Utilisateur",
      ];

      // Convert data to CSV format
      const csvContent = [
        headers.join(";"), // Header row
        ...data.map((item) => [
          item._id,
          format(new Date(item.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: fr }),
          item.value_cm,
          item.volume_l,
          item.userEmail || "",
          item.userName || "",
        ].join(";"))
      ].join("\n");

      // Create Blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = format(new Date(), "yyyy-MM-dd");

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${dateStr}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Exportation réussie", {
        description: `Les données ont été exportées avec succès.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Erreur d'exportation", {
        description: "Une erreur est survenue lors de l'exportation des données.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const dateStr = format(new Date(), "yyyy-MM-dd");
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}-${dateStr}.json`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Exportation réussie", {
        description: `Les données ont été exportées avec succès.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Erreur d'exportation", {
        description: "Une erreur est survenue lors de l'exportation des données.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exporter les données
          </CardTitle>
          <CardDescription>
            Aucune donnée à exporter actuellement.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Exporter les données
        </CardTitle>
        <CardDescription>
          Exportez les données de l'historique pour les analyser ou les sauvegarder.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={exportToCSV}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exportation..." : "Exporter en CSV"}
          </Button>
          <Button
            onClick={exportToJSON}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exportation..." : "Exporter en JSON"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataExport;
