import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/protectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/sonner"; // ShadCN Toaster

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} /> {/* Alias pour plus de clarté si HomePage = Login Page */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Autres routes protégées ici */}
          </Route>
          {/* Route 404 optionnelle */}
          {/* <Route path="*" element={<NotFoundPage />} /> */}
        </Routes>
      </Router>
      <Toaster /> {/* S'assurer que Toaster est accessible globalement */}
    </AuthProvider>
  );
}

export default App;