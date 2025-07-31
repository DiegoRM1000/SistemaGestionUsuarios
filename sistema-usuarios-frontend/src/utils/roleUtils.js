// src/utils/roleUtils.js

/**
 * Mapea el nombre técnico de un rol del backend a un nombre amigable para el frontend.
 * @param {string} roleName El nombre del rol tal como viene del backend (ej. "ROLE_ADMIN").
 * @returns {string} El nombre amigable del rol (ej. "Administrador").
 */
export const getFriendlyRoleName = (roleName) => {
    switch (roleName) {
        case 'ROLE_ADMIN':
            return 'Administrador';
        case 'ROLE_SUPERVISOR':
            return 'Supervisor';
        case 'ROLE_EMPLOYEE':
            return 'Empleado';
        default:
            // En caso de que el rol no sea reconocido, devuelve el nombre original o un valor por defecto
            return roleName.replace('ROLE_', '').replace('_', ' ').toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
};