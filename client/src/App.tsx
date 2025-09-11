import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/protectedRoute";
import { AuthProvider } from "./contexts/AuthContext"; // Or from './hooks/useAuth'
import DashboardLayout from "./components/layout/DashboardLayout";
import ConversionPage from "./pages/ConversionPage"; // Should point to the file in src/pages/
import HistoriquePage from "@/pages/HistoriquePage";
import SettingsPage from "./pages/SettingsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MaintenancePage from "./pages/MaintenancePage";
import AlertsPage from "./pages/AlertsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import OfflineIndicator from "./components/OfflineIndicator";

function App() {
  console.log("App.tsx: Rendering. AuthProvider will wrap Routes.");
  return (
    <AuthProvider>
      {" "}
      {/* AuthProvider is the outermost context provider relevant to auth */}
      <OfflineIndicator />
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          {/* 👇 NEW ROUTES FOR LEGAL PAGES 👇 */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          {/* 👆 END NEW ROUTES 👆 */}

          <Route element={<ProtectedRoute />}>
            {" "}
            {/* ProtectedRoute uses useAuth */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              {" "}
              {/* DashboardLayout uses useAuth (via itself or Sidebar) */}
              <Route index element={<Navigate to="conversion" replace />} />
              <Route path="conversion" element={<ConversionPage />} />
              <Route path="historique" element={<HistoriquePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="alerts" element={<AlertsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
