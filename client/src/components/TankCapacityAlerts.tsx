import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Volume2,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import api from "../lib/api";
import { toast } from "sonner";

interface AlertThreshold {
  id: string;
  name: string;
  threshold: number; // percentage
  active: boolean;
  lastTriggered?: string;
}

interface ActiveAlert {
  id: string;
  thresholdId: string;
  threshold: number;
  currentValue: number;
  triggeredAt: string;
  acknowledged: boolean;
  message: string;
}

const TankCapacityAlerts: React.FC = () => {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([
    { id: "critical", name: "Niveau critique", threshold: 10, active: true },
    { id: "warning", name: "Niveau bas", threshold: 20, active: true },
    { id: "optimal", name: "Niveau optimal", threshold: 80, active: false }
  ]);

  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch active alerts
        const alertsResponse = await api.get("/alerts/active");
        setActiveAlerts(alertsResponse.data);

        // Fetch thresholds
        const thresholdsResponse = await api.get("/alerts/thresholds");
        setThresholds(thresholdsResponse.data);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
        setError("Impossible de charger les alertes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Set up interval to check for new alerts
    const interval = setInterval(fetchAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Check current tank level against thresholds
  const checkTankLevel = async () => {
    setIsChecking(true);

    try {
      const response = await api.get("/data/latest");
      const currentLevel = (response.data.volume_l / 50710) * 100; // Assuming max capacity is 50710L

      // Check against each active threshold
      const newAlerts: ActiveAlert[] = [];

      thresholds.forEach(threshold => {
        if (threshold.active && currentLevel <= threshold.threshold) {
          // Check if alert already exists for this threshold
          const existingAlert = activeAlerts.find(
            alert => alert.thresholdId === threshold.id && !alert.acknowledged
          );

          if (!existingAlert) {
            // Create new alert
            newAlerts.push({
              id: `alert-${Date.now()}`,
              thresholdId: threshold.id,
              threshold: threshold.threshold,
              currentValue: currentLevel,
              triggeredAt: new Date().toISOString(),
              acknowledged: false,
              message: `Le niveau du réservoir est inférieur à ${threshold.threshold}%`
            });
          }
        }
      });

      // Add new alerts
      if (newAlerts.length > 0) {
        const updatedAlerts = [...activeAlerts, ...newAlerts];
        setActiveAlerts(updatedAlerts);

        // In a real app, you would save these to the backend
        // await api.post("/alerts/batch", { alerts: newAlerts });

        // Show notification for new alerts
        newAlerts.forEach(alert => {
          toast.warning("Alerte de niveau réservoir", {
            description: alert.message
          });
        });
      }
    } catch (err) {
      console.error("Failed to check tank level:", err);
      toast.error("Erreur", {
        description: "Impossible de vérifier le niveau du réservoir"
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const updatedAlerts = activeAlerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      setActiveAlerts(updatedAlerts);

      // In a real app, you would update the alert in the backend
      // await api.patch(`/alerts/${alertId}/acknowledge`);

      toast.success("Alerte traitée", {
        description: "L'alerte a été marquée comme traitée."
      });
    } catch (err) {
      console.error("Failed to acknowledge alert:", err);
      toast.error("Erreur", {
        description: "Impossible de traiter l'alerte."
      });
    }
  };

  // Toggle threshold
  const toggleThreshold = async (thresholdId: string) => {
    try {
      const updatedThresholds = thresholds.map(threshold => 
        threshold.id === thresholdId ? { ...threshold, active: !threshold.active } : threshold
      );
      setThresholds(updatedThresholds);

      // In a real app, you would update the threshold in the backend
      // await api.patch(`/alerts/thresholds/${thresholdId}`, { active: !thresholds.find(t => t.id === thresholdId)?.active });

      toast.success("Paramètre mis à jour", {
        description: `Le seuil ${thresholds.find(t => t.id === thresholdId)?.name} a été ${!thresholds.find(t => t.id === thresholdId)?.active ? "activé" : "désactivé"}.`
      });
    } catch (err) {
      console.error("Failed to toggle threshold:", err);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour le seuil."
      });
    }
  };

  // Get threshold color
  const getThresholdColor = (threshold: number) => {
    if (threshold <= 10) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (threshold <= 20) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  // Get alert icon
  const getAlertIcon = (threshold: number) => {
    if (threshold <= 10) return <AlertTriangle className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", { locale: fr });
    } catch {
      return "Date inconnue";
    }
  };

  // Get active alerts count
  const activeAlertsCount = activeAlerts.filter(alert => !alert.acknowledged).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertes de Niveau Réservoir
            {activeAlertsCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {activeAlertsCount} {activeAlertsCount === 1 ? "active" : "actives"}
              </Badge>
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkTankLevel}
              disabled={isChecking}
            >
              {isChecking ? (
                <Clock className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Vérifier maintenant
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Bell className="animate-pulse h-6 w-6 mr-2" />
            Chargement des alertes...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Thresholds */}
            <div>
              <h3 className="font-medium mb-3">Seuils d'alerte</h3>
              <div className="space-y-3">
                {thresholds.map((threshold) => (
                  <div key={threshold.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getAlertIcon(threshold.threshold)}
                      <span>{threshold.name}</span>
                      <Badge className={getThresholdColor(threshold.threshold)}>
                        {threshold.threshold}%
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleThreshold(threshold.id)}
                    >
                      {threshold.active ? (
                        <Bell className="h-4 w-4 text-green-500" />
                      ) : (
                        <BellOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Alerts */}
            <div>
              <h3 className="font-medium mb-3">Alertes actives</h3>
              {activeAlerts.filter(alert => !alert.acknowledged).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-gray-500">Aucune alerte active</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts
                    .filter(alert => !alert.acknowledged)
                    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
                    .map((alert) => {
                      const threshold = thresholds.find(t => t.id === alert.thresholdId);
                      return (
                        <Alert key={alert.id} className="border-l-4 border-l-red-500">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{alert.message}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Déclenché le {formatDate(alert.triggeredAt)}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => acknowledgeAlert(alert.id)}
                              >
                                Traiter
                              </Button>
                            </div>
                          </AlertDescription>
                        </Alert>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Recent Alerts */}
            {activeAlerts.filter(alert => alert.acknowledged).length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Alertes récentes</h3>
                <div className="space-y-3">
                  {activeAlerts
                    .filter(alert => alert.acknowledged)
                    .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
                    .slice(0, 5)
                    .map((alert) => {
                      const threshold = thresholds.find(t => t.id === alert.thresholdId);
                      return (
                        <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm">{alert.message}</p>
                              <p className="text-xs text-gray-500">
                                Traité le {formatDate(alert.triggeredAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TankCapacityAlerts;
