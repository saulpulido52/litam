import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

// Importar layouts
import MainLayout from './layouts/MainLayout';

// Importar páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import AdminDashboard from './pages/AdminDashboard';
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
        
        {/* Rutas protegidas con layout */}
        <Route path="/" element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/patients" element={<PatientsPage />} />
          <Route path="/patients/:patientId/clinical-records" element={<ClinicalRecordsPage />} />
          <Route path="/diet-plans" element={<DietPlansPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/progress" element={<ProgressTrackingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
        
        {/* Ruta por defecto que redirige al home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default App;
