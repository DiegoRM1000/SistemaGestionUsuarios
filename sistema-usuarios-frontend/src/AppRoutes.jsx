import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider'; // ¡Importa el AuthProvider!

// Asegúrate de crear estas carpetas y archivos en src/components/
import DashboardPage from './pages/DashboardPage.jsx';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginLayout from "./layouts/LoginLayout.jsx";
import DashboardHome from './components/dashboard/DashboardHome';
import UserManagementPage from './components/users/UserManagementPage';
import ReportsPage from './components/reports/ReportsPage';
import LogsPage from './components/logs/LogsPage';
import ProfilePage from './components/profile/ProfilePage';




const AppRoutes = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginLayout />} />

                    {/* Ruta protegida para el Dashboard Layout */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPERVISOR']}>
                                <DashboardPage /> {/* Renderiza el layout principal del dashboard */}
                            </PrivateRoute>
                        }
                    >
                        {/* Rutas anidadas que se renderizan dentro de <Outlet /> en DashboardPage */}
                        <Route index element={<DashboardHome />} /> {/* /dashboard (ruta por defecto) */}
                        <Route path="users" element={<UserManagementPage />} /> {/* /dashboard/users */}
                        <Route path="reports" element={<ReportsPage />} /> {/* /dashboard/reports */}
                        <Route path="logs" element={<LogsPage />} /> {/* /dashboard/logs */}
                        <Route path="profile" element={<ProfilePage />} /> {/* /dashboard/profile */}
                    </Route>


                    {/* Redirección por defecto y 404 */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<h1>404 - Página No Encontrada</h1>} />
                </Routes>
            </AuthProvider>
        </Router>

    );
};

export default AppRoutes;