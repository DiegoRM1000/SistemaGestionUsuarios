// src/context/AuthContext.js
import { createContext, useContext } from 'react'; // Solo necesitamos createContext y useContext aquí

// Crea el contexto de autenticación
export const AuthContext = createContext(null);

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = () => {
    return useContext(AuthContext);
};