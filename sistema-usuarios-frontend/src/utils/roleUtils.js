// src/utils/roleUtils.js

/**
 * Retorna un color hex para cada rol.
 * @param {string} roleName El nombre del rol del usuario.
 * @returns {string} El color hexadecimal asociado.
 */
export const getRoleColor = (roleName) => {
    switch (roleName) {
        case 'ADMIN':
            return '#dc2626'; // Rojo
        case 'SUPERVISOR':
            return '#1d4ed8'; // Azul
        case 'EMPLOYEE':
            return '#4f46e5'; // Índigo
        default:
            return '#6b7280'; // Gris
    }
};
