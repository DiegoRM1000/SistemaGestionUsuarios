import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage'; // ¡AJUSTE AQUÍ! Ruta correcta para LoginPage

// Asegúrate de crear estas carpetas y archivos en src/components/
import DashboardPage from './components/dashboard/DashboardPage';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import EmployeeDashboardPage from './components/employee/EmployeeDashboardPage';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginLayout from "./layouts/LoginLayout.jsx";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Ruta pública para el login */}
                <Route path="/login" element={<LoginLayout />} />

                {/* Rutas privadas */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE', 'ROLE_SUPERVISOR']}>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin-dashboard"
                    element={
                        <PrivateRoute requiredRoles={['ROLE_ADMIN']}>
                            <AdminDashboardPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/employee-dashboard"
                    element={
                        <PrivateRoute requiredRoles={['ROLE_EMPLOYEE']}>
                            <EmployeeDashboardPage />
                        </PrivateRoute>
                    }
                />

                {/* Redirección por defecto: si no hay ruta, va a login */}
                {/* Esto asegura que la página de inicio sea siempre el login si no estás en una ruta específica */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* Opcional: Ruta para 404 Not Found */}
                <Route path="*" element={<h1>404 - Página No Encontrada</h1>} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;