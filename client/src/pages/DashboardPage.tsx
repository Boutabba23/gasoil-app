import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have a custom hook for authentication
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import ConversionForm from '../components/ConversionForm';
import HistoryTable from '../components/HistoryTable';
import DashboardStats from '../components/DashboardStats';
import TankVisualization from '../components/TankVisualization';
import RealTimeMonitor from '../components/RealTimeMonitor';
import MaintenanceReminder from '../components/MaintenanceReminder';
import FuelAnalytics from '../components/FuelAnalytics';
import TankCapacityAlerts from '../components/TankCapacityAlerts';
import DashboardHeader from '../components/DashboardHeader';
import { Toaster } from "@/components/ui/sonner"; // Pour afficher les notifications
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // État pour forcer le rafraîchissement de l'historique après une nouvelle conversion
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);
  
  // Stats state
  const [stats, setStats] = useState({
    lastMeasurement: null as {
      value_cm: number;
      volume_l: number;
      createdAt: string;
    } | null
  });

  const handleLogout = async () => {
    try {
      await logout(); // L'appel API à /auth/logout est optionnel dans useAuth, géré côté client principalement
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
      // Afficher une notification d'erreur si nécessaire
    }
  };
  
  const onConversionSuccess = (data: any) => {
    setRefreshHistoryKey(prevKey => prevKey + 1); // Change la clé pour rafraîchir HistoryTable
    
    // Update stats with the latest measurement
    setStats({
      lastMeasurement: {
        value_cm: data.cm,
        volume_l: data.litres,
        createdAt: new Date().toISOString()
      }
    });
  };

  if (!user) {
    return <div className="p-4">Chargement des informations utilisateur...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <DashboardHeader 
        title="Tableau de bord - Gestion Gasoil" 
        subtitle="Surveillance et gestion du réservoir de carburant"
      />

      {/* Stats Section */}
      <div className="mb-8">
        <DashboardStats refreshTrigger={refreshHistoryKey} />
      </div>
      
      {/* Real-time Monitor */}
      <div className="mb-8">
        <RealTimeMonitor />
      </div>
      
      {/* Maintenance Reminder */}
      <div className="mb-8">
        <MaintenanceReminder />
      </div>
      
      {/* Fuel Analytics */}
      <div className="mb-8">
        <FuelAnalytics />
      </div>
      
      {/* Tank Capacity Alerts */}
      <div className="mb-8">
        <TankCapacityAlerts />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Convertir Jauge en Litres</CardTitle>
              <CardDescription>Entrez la mesure de la jauge pour obtenir le volume.</CardDescription>
            </CardHeader>
            <CardContent>
              <ConversionForm onConversionSuccess={onConversionSuccess} />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Visualisation de la Citerne</CardTitle>
              <CardDescription>Représentation visuelle du niveau actuel</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.lastMeasurement ? (
                <TankVisualization 
                  currentLitres={stats.lastMeasurement.volume_l}
                  maxLitres={50710}
                  lastCmValue={stats.lastMeasurement.value_cm}
                  isInitialLoading={false}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">Aucune donnée disponible</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Prélèvements</CardTitle>
            </CardHeader>
            <CardContent>
              <HistoryTable key={refreshHistoryKey} /> {/* La clé force le re-render/fetch */}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster /> {/* Conteneur pour les notifications */}
    </div>
  );
};

export default DashboardPage;