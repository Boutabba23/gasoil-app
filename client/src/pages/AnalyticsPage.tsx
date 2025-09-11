import React from "react";
import FuelAnalytics from "../components/FuelAnalytics";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analyse de Consommation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualisez et analysez les données de consommation de carburant
        </p>
      </div>

      <FuelAnalytics />
    </div>
  );
};

export default AnalyticsPage;
