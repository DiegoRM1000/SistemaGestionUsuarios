// src/utils/roleUtils.js

/**
 * Mapea el nombre técnico de un rol del backend a un nombre amigable para el frontend.
 * Asume que cada usuario tiene uno de los tres roles definidos: ADMIN, SUPERVISOR, EMPLOYEE.
 * @param {string} roleName El nombre del rol tal como viene del backend (ej. "ROLE_ADMIN").
 * @returns {string} El nombre amigable del rol (ej. "Administrador" o "Rol Inválido").
 */
export const getFriendlyRoleName = (roleName) => {
    switch (roleName) {
        case 'ROLE_ADMIN':
            return 'Administrador';
        case 'ROLE_SUPERVISOR':
            return 'Supervisor';
        case 'ROLE_EMPLOYEE':
            return 'Empleado';
        case 'ERROR_NO_ROLE': // Caso para el valor de fallback del DataGrid
            return 'Error: Sin Rol';
        default:
            // Este caso default solo se debería alcanzar si el backend envía un rol no mapeado
            // o si hay un error en la obtención del rol.
            console.warn(`Rol no reconocido: ${roleName}. Por favor, verifique la data.`);
            return 'Rol Inválido'; // Mensaje claro para roles inesperados
    }
};