import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have a custom hook for authentication
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import ConversionForm from '../components/ConversionForm';
import HistoryTable from '../components/HistoryTable';
import { Toaster } from "@/components/ui/sonner"; // Pour afficher les notifications
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // État pour forcer le rafraîchissement de l'historique après une nouvelle conversion
  const [refreshHistoryKey, setRefreshHistoryKey] = useState(0);

  const handleLogout = async () => {
    try {
      await logout(); // L'appel API à /auth/logout est optionnel dans useAuth, géré côté client principalement
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
      // Afficher une notification d'erreur si nécessaire
    }
  };
  
  const onConversionSuccess = () => {
    setRefreshHistoryKey(prevKey => prevKey + 1); // Change la clé pour rafraîchir HistoryTable
  };

  if (!user) {
    return <div className="p-4">Chargement des informations utilisateur...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Tableau de bord - Gestion Gasoil
        </h1>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-600">
            Bonjour, {user.displayName}
            {user.profilePicture && <img src={user.profilePicture} alt="profil" className="w-8 h-8 rounded-full inline-block ml-2" />}
          </span>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Convertir Jauge en Litres</CardTitle>
            <CardDescription>Entrez la mesure de la jauge pour obtenir le volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversionForm onConversionSuccess={onConversionSuccess} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2"> {/* Prend toute la largeur sur les grands écrans */}
          <CardHeader>
            <CardTitle>Historique des Prélèvements</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryTable key={refreshHistoryKey} /> {/* La clé force le re-render/fetch */}
          </CardContent>
        </Card>
      </div>
      <Toaster /> {/* Conteneur pour les notifications */}
    </div>
  );
};

export default DashboardPage;