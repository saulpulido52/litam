import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Importar layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Importar páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminNutritionists from './pages/admin/AdminNutritionists';
import AdminPatients from './pages/admin/AdminPatients';
import AdminSystemHealth from './pages/admin/AdminSystemHealth';
import AdminDataIntegrity from './pages/admin/AdminDataIntegrity';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminMonetization from './pages/admin/AdminMonetization';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';
import AdminAuditoriaEliminacionesPage from './pages/admin/AdminAuditoriaEliminacionesPage';
import AdminRoute from './components/Admin/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientsPage from './pages/PatientsPage';
import DietPlansPage from './pages/DietPlansPage';
import MessagingPage from './pages/MessagingPage';
import ProgressTrackingPage from './pages/ProgressTrackingPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ClinicalRecordsPage from './pages/ClinicalRecordsPage';
import NotificationsPage from './pages/NotificationsPage';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        
        {/* Rutas de administración protegidas y con layout propio */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="nutritionists" element={<AdminNutritionists />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="monetization" element={<AdminMonetization />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="system-health" element={<AdminSystemHealth />} />
          <Route path="data-integrity" element={<AdminDataIntegrity />} />
          <Route path="logs" element={<AdminLogs />} />
          <Route path="auditoria-eliminaciones" element={<AdminAuditoriaEliminacionesPage />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* Rutas protegidas con layout de usuario */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
          <Route path="/patients/:patientId/clinical-records" element={<ProtectedRoute><ClinicalRecordsPage /></ProtectedRoute>} />
          <Route path="/diet-plans" element={<ProtectedRoute><DietPlansPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><ProgressTrackingPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        </Route>
        
        {/* Ruta por defecto que redirige al home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default App;
