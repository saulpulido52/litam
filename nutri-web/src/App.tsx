import React, { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner, Container } from 'react-bootstrap';
import './App.css';
import './styles/responsive-table.css';
import './styles/lcp-optimizations.css';
import { addResourceHints } from './hooks/usePreloadResources';

// **IMPORTACIONES DIRECTAS - Solo layouts y componentes críticos**
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

// **LAZY LOADING - Páginas que se cargan bajo demanda**
// Páginas públicas (críticas - carga inmediata)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';

// Dashboard principal (crítico)
import DashboardPage from './pages/DashboardPage';

// **LAZY LOADING PARA PÁGINAS NO CRÍTICAS**
const AppointmentsPage = React.lazy(() => import('./pages/AppointmentsPage'));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage'));
const AppointmentBookingTestPage = React.lazy(() => import('./pages/AppointmentBookingTestPage'));
const PatientsPage = React.lazy(() => import('./pages/PatientsPage'));
const DietPlansPage = React.lazy(() => import('./pages/DietPlansPage'));
const MessagingPage = React.lazy(() => import('./pages/MessagingPage'));
const ProgressTrackingPage = React.lazy(() => import('./pages/ProgressTrackingPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const NutritionistSettingsPage = React.lazy(() => import('./pages/NutritionistSettingsPage'));
const ClinicalRecordsPage = React.lazy(() => import('./pages/ClinicalRecordsPage'));
const SeguimientosPage = React.lazy(() => import('./pages/SeguimientosPage'));
const ExpedientesInteligentesPage = React.lazy(() => import('./pages/ExpedientesInteligentesPage'));
const GrowthChartsPage = React.lazy(() => import('./pages/GrowthChartsPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));

// **LAZY LOADING PARA PÁGINAS DE ADMIN**
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = React.lazy(() => import('./pages/admin/AdminUsers'));
const AdminNutritionists = React.lazy(() => import('./pages/admin/AdminNutritionists'));
const AdminPatients = React.lazy(() => import('./pages/admin/AdminPatients'));
const AdminSystemHealth = React.lazy(() => import('./pages/admin/AdminSystemHealth'));
const AdminDataIntegrity = React.lazy(() => import('./pages/admin/AdminDataIntegrity'));
const AdminSubscriptions = React.lazy(() => import('./pages/admin/AdminSubscriptions'));
const AdminMonetization = React.lazy(() => import('./pages/admin/AdminMonetization'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminLogs = React.lazy(() => import('./pages/admin/AdminLogs'));
const AdminAuditoriaEliminacionesPage = React.lazy(() => import('./pages/admin/AdminAuditoriaEliminacionesPage'));

// **COMPONENTE DE LOADING OPTIMIZADO**
const LoadingFallback: React.FC = () => (
  <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
    <div className="text-center">
      <Spinner animation="border" variant="primary" className="mb-3" />
      <p className="text-muted">Cargando...</p>
    </div>
  </Container>
);

const App: React.FC = () => {
  // 🚀 OPTIMIZACIÓN: Agregar resource hints globales para mejorar LCP
  useEffect(() => {
    addResourceHints();
  }, []);

  return (
    <div className="App">
      <Routes>
        {/* **RUTAS PÚBLICAS - CARGA INMEDIATA** */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* **RUTAS DE ADMINISTRACIÓN - LAZY LOADING** */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminUsers />
            </Suspense>
          } />
          <Route path="nutritionists" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminNutritionists />
            </Suspense>
          } />
          <Route path="patients" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminPatients />
            </Suspense>
          } />
          <Route path="subscriptions" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminSubscriptions />
            </Suspense>
          } />
          <Route path="monetization" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminMonetization />
            </Suspense>
          } />
          <Route path="reports" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminReports />
            </Suspense>
          } />
          <Route path="system-health" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminSystemHealth />
            </Suspense>
          } />
          <Route path="data-integrity" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminDataIntegrity />
            </Suspense>
          } />
          <Route path="logs" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminLogs />
            </Suspense>
          } />
          <Route path="auditoria-eliminaciones" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminAuditoriaEliminacionesPage />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminSettings />
            </Suspense>
          } />
        </Route>

        {/* **RUTAS PROTEGIDAS - LAZY LOADING** */}
        <Route path="/" element={<MainLayout />}>
          {/* Dashboard crítico - carga inmediata */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          {/* Páginas no críticas - lazy loading */}
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <AppointmentsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <CalendarPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/appointment-booking-test" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <AppointmentBookingTestPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <PatientsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/patients/:patientId/clinical-records" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ClinicalRecordsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/patients/:patientId/seguimientos" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <SeguimientosPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/expedientes-inteligentes" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ExpedientesInteligentesPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/diet-plans" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <DietPlansPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MessagingPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ProgressTrackingPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/growth-charts" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <GrowthChartsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ReportsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <ProfilePage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <SettingsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/nutritionist-settings" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <NutritionistSettingsPage />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <NotificationsPage />
              </Suspense>
            </ProtectedRoute>
          } />
        </Route>

        {/* Ruta por defecto que redirige al home */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </div>
  );
};

export default App;
