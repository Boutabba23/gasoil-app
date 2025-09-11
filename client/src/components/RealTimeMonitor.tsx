import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "../lib/api";

interface TankData {
  value_cm: number;
  volume_l: number;
  percentage: number;
  status: "normal" | "warning" | "critical";
  lastUpdated: string;
}

const MAX_LITRES = 50710;
const WARNING_THRESHOLD = 20; // 20%
const CRITICAL_THRESHOLD = 10; // 10%

const RealTimeMonitor: React.FC = () => {
  const [tankData, setTankData] = useState<TankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Fetch tank data
  const fetchTankData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/data/latest");
      const data = response.data;

      const percentage = (data.volume_l / MAX_LITRES) * 100;
      let status: "normal" | "warning" | "critical" = "normal";

      if (percentage <= CRITICAL_THRESHOLD) {
        status = "critical";
      } else if (percentage <= WARNING_THRESHOLD) {
        status = "warning";
      }

      setTankData({
        value_cm: data.value_cm,
        volume_l: data.volume_l,
        percentage,
        status,
        lastUpdated: data.createdAt,
      });

      setLastRefreshTime(new Date());
    } catch (err) {
      console.error("Failed to fetch tank data:", err);
      setError("Impossible de charger les données du réservoir");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (isAutoRefresh) {
      fetchTankData();
      const interval = setInterval(fetchTankData, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [fetchTankData, isAutoRefresh]);

  // Initial fetch
  useEffect(() => {
    fetchTankData();
  }, []);

  const getStatusColor = () => {
    if (!tankData) return "bg-gray-500";

    switch (tankData.status) {
      case "critical":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusText = () => {
    if (!tankData) return "Inconnu";

    switch (tankData.status) {
      case "critical":
        return "Niveau critique";
      case "warning":
        return "Niveau bas";
      default:
        return "Normal";
    }
  };

  const getStatusIcon = () => {
    if (!tankData) return <Clock className="h-4 w-4" />;

    switch (tankData.status) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const formatLastUpdate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date inconnue";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isAutoRefresh ? "animate-spin" : ""}`} />
            Surveillance en temps réel
          </span>
          <div className="flex items-center gap-2">
            <Badge 
              variant={tankData?.status === "normal" ? "default" : "destructive"}
              className={cn(
                "flex items-center gap-1",
                tankData?.status === "normal" && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                tankData?.status === "warning" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                tankData?.status === "critical" && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              )}
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin h-6 w-6 mr-2" />
            Chargement des données...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-500">{error}</p>
            <Button 
              onClick={fetchTankData} 
              variant="outline" 
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        ) : tankData && (
          <div className="space-y-6">
            {/* Tank level visualization */}
            <div className="relative">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    tankData.status === "critical" && "bg-red-500",
                    tankData.status === "warning" && "bg-yellow-500",
                    tankData.status === "normal" && "bg-green-500"
                  )}
                  style={{ width: `${tankData.percentage}%` }}
                />
              </div>

              {/* Threshold markers */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-red-500"
                style={{ left: `${CRITICAL_THRESHOLD}%` }}
              />
              <div 
                className="absolute top-0 bottom-0 w-px bg-yellow-500"
                style={{ left: `${WARNING_THRESHOLD}%` }}
              />

              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>{WARNING_THRESHOLD}%</span>
                <span>{CRITICAL_THRESHOLD}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Volume</p>
                <p className="text-xl font-bold">
                  {tankData.volume_l.toLocaleString()} L
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Jauge</p>
                <p className="text-xl font-bold">
                  {tankData.value_cm.toFixed(1)} cm
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Niveau</p>
                <p className="text-xl font-bold">
                  {tankData.percentage.toFixed(1)}%
                </p>
              </div>

              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                <p className="text-sm">
                  {lastRefreshTime ? 
                    lastRefreshTime.toLocaleTimeString("fr-FR", { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    }) : 
                    "N/A"
                  }
                </p>
              </div>
            </div>

            {/* Auto-refresh toggle */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isAutoRefresh ? "animate-spin" : ""}`} />
                <span>Actualisation automatique</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              >
                {isAutoRefresh ? "Désactiver" : "Activer"}
              </Button>
            </div>

            {/* Manual refresh button */}
            <div className="flex justify-center pt-2">
              <Button
                onClick={fetchTankData}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser maintenant
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMonitor;
