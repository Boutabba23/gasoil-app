import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/protectedRoute';
import { AuthProvider } from './contexts/AuthContext'; // Or from './hooks/useAuth'
import DashboardLayout from './components/layout/DashboardLayout';
import ConversionPage from '@/components/ConversionForm';
import HistoriquePage from '@/components/HistoryTable';

function App() {
  console.log("App.tsx: Rendering. AuthProvider will wrap Routes.");
  return (
    <AuthProvider> {/* AuthProvider is the outermost context provider relevant to auth */}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route element={<ProtectedRoute />}> {/* ProtectedRoute uses useAuth */}
            <Route path="/dashboard" element={<DashboardLayout />}> {/* DashboardLayout uses useAuth (via itself or Sidebar) */}
              <Route index element={<Navigate to="conversion" replace />} />
                            <Route path="conversion" element={<ConversionPage />} /> 

              <Route path="historique" element={<HistoriquePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;