import React from "react";
import MaintenanceReminder from "../components/MaintenanceReminder";

const MaintenancePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Maintenance</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les tâches de maintenance et les rappels pour le réservoir
        </p>
      </div>

      <MaintenanceReminder />
    </div>
  );
};

export default MaintenancePage;
