import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading, token } = useAuth();

  if (isLoading) {
    return <div>Chargement de la session utilisateur...</div>; // Ou un spinner
  }

  // Si le chargement est terminé et qu'il n'y a pas d'utilisateur (et pas de token, pour éviter un flash si token est là mais user pas encore fetché)
  if (!user && !token) {
    return <Navigate to="/" replace />; // Ou '/login' si HomePage est autre chose
  }
  // S'il y a un token mais user n'est pas encore là (premier chargement avec token existant)
  // alors `isLoading` devrait encore être true ou sur le point de finir.
  // Si isLoading est false, et qu'il y a un token, mais pas d'user, cela peut signifier un token invalide
  // AuthContext gère déjà ce cas et nettoierait le token.

  return <Outlet />; // Si l'utilisateur est authentifié, affiche le contenu de la route
};

export default ProtectedRoute;