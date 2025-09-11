import React from "react";
import TankCapacityAlerts from "../components/TankCapacityAlerts";

const AlertsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Alertes</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les alertes de niveau de carburant et les seuils d'alerte
        </p>
      </div>

      <TankCapacityAlerts />
    </div>
  );
};

export default AlertsPage;
