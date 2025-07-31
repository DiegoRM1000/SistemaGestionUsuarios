// src/context/AuthProvider.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext'; // ¡Importa AuthContext desde el nuevo archivo!
import { toast } from 'react-toastify'; // ¡Importa toast!


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [role, setRole] = useState(localStorage.getItem('userRole'));
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserDetails = async (authToken) => {
        setIsLoading(true); // Inicia el estado de carga
        if (!authToken) {
            setUser(null);
            setRole(null);
            setIsLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8080/api/users/me', {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
            setUser(response.data);

            const userRoleFromServer = response.data.roles && response.data.roles.length > 0
                ? response.data.roles[0].name
                : 'ROLE_USER';
            setRole(userRoleFromServer);
            localStorage.setItem('userRole', userRoleFromServer);

        } catch (error) {
            console.error('Error al obtener los detalles del usuario:', error);
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('userRole');
            setToken(null);
            setUser(null);
            setRole(null);
            // Opcional: toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');

        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserDetails(token);
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            const newAccessToken = response.data.accessToken;
            const newUserRole = response.data.role;

            localStorage.setItem('jwtToken', newAccessToken);
            localStorage.setItem('userRole', newUserRole);

            setToken(newAccessToken);
            setRole(newUserRole);
            await fetchUserDetails(newAccessToken);
            return { success: true, role: newUserRole };
        } catch (error) {
            console.error('Login fallido desde AuthProvider:', error);
            const errorMessage = error.response?.data?.message || 'Credenciales inválidas.';
            toast.error(`Error de inicio de sesión: ${errorMessage}`); // ¡Muestra el toast de error!
            return { success: false, message: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        setToken(null);
        setRole(null);
        setUser(null);
        toast.info('Has cerrado sesión correctamente.');
    };

    const authContextValue = {
        isAuthenticated: !!token,
        user,
        role,
        token,
        isLoading,
        login,
        logout,
        fetchUserDetails
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};