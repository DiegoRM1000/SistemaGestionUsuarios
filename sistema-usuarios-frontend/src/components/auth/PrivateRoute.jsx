import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRoles }) => {
    const isAuthenticated = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) {
        // Si no está autenticado, redirige a la página de login
        return <Navigate to="/login" replace />;
    }

    // Verifica si el usuario tiene alguno de los roles requeridos
    if (requiredRoles && !requiredRoles.includes(userRole)) {
        // Si no tiene el rol requerido, redirige a una página de acceso denegado o al dashboard general
        // O podrías redirigir a un 403 o a una página de error.
        console.warn(`Access Denied: User with role '${userRole}' tried to access a route requiring roles: ${requiredRoles.join(', ')}`);
        // Para simplificar, redirigimos al dashboard general si no tiene el rol específico
        return <Navigate to="/dashboard" replace />;
    }

    // Si está autenticado y tiene el rol (o no se requiere un rol específico), renderiza los hijos
    return children;
};

export default PrivateRoute;