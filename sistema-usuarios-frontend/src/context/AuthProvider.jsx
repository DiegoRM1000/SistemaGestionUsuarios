// src/context/AuthProvider.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import apiClient, { setAuthDataForInterceptors } from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('jwtToken'));
    const [role, setRole] = useState(localStorage.getItem('userRole'));
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRole');
        setToken(null);
        setRole(null);
        setUser(null);
        toast.info('Has cerrado sesión correctamente.');
    }, []);

    const fetchUserDetails = useCallback(async (authToken) => {
        setIsLoading(true);
        if (!authToken) {
            setUser(null);
            setRole(null);
            setIsLoading(false);
            return;
        }
        try {
            const response = await apiClient.get('/users/me');
            setUser(response.data);

            // --- CAMBIO AQUÍ: El backend ahora envía los roles como un Set<String> ---
            // Tomamos el primer rol del Set y lo usamos
            const userRoleFromServer = response.data.roles && response.data.roles.length > 0
                ? response.data.roles[0] // Accedemos al primer elemento del array de roles
                : 'ROLE_USER'; // Rol por defecto si no se encuentra ninguno

            setRole(userRoleFromServer);
            localStorage.setItem('userRole', userRoleFromServer);

        } catch (error) {
            console.error('Error al obtener los detalles del usuario:', error);
            if (error.response?.status !== 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                setToken(null);
                setUser(null);
                setRole(null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [setRole, setToken, setUser, setIsLoading]);

    const login = useCallback(async (email, password) => {
        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            const newAccessToken = response.data.accessToken;

            // --- ¡EL CAMBIO CRÍTICO ESTÁ AQUÍ! ---
            // Tu backend devuelve un array de roles, no un solo campo 'role'.
            // Debemos obtener el primer rol del array para guardarlo.
            const newUserRole = response.data.roles && response.data.roles.length > 0
                ? response.data.roles[0]
                : 'ROLE_USER'; // Usamos un valor por defecto seguro

            localStorage.setItem('jwtToken', newAccessToken);
            localStorage.setItem('userRole', newUserRole);

            setToken(newAccessToken);
            setRole(newUserRole);
            await fetchUserDetails(newAccessToken);
            return { success: true, role: newUserRole };
        } catch (error) {
            console.error('Login fallido desde AuthProvider:', error);
            const errorMessage = error.response?.data?.message || 'Credenciales inválidas.';
            toast.error(`Error de inicio de sesión: ${errorMessage}`);
            return { success: false, message: errorMessage };
        }
    }, [fetchUserDetails, setRole, setToken]);

    useEffect(() => {
        setAuthDataForInterceptors(logout, navigate);
    }, [logout, navigate]);

    useEffect(() => {
        if (token) {
            fetchUserDetails(token);
        } else {
            setIsLoading(false);
        }
    }, [token, fetchUserDetails]);

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