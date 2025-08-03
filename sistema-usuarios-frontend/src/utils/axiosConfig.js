
import axios from 'axios';
import { toast } from 'react-toastify'; // Para las notificaciones
import { AuthContext } from '../context/AuthContext'; // Para acceder al contexto de autenticación



// ==========================================================
// NOTA IMPORTANTE: CÓMO MANEJAR EL CONTEXTO EN UN INTERCEPTOR
// ==========================================================
// El problema con los interceptores es que son funciones "fuera" del árbol de componentes React.
// No pueden usar hooks como useContext() directamente.
// Para acceder al contexto (y sus funciones como logout, navigate), necesitamos una forma de "inyectarlo".
// La solución más común y limpia es usar una variable global MUTABLE
// que se actualice con la función `setAuthDataForInterceptors`
// expuesta por tu AuthProvider.

let authDataForInterceptors = {
    logout: () => console.warn('Logout function not yet set for interceptors.'),
    navigate: () => console.warn('Navigate function not yet set for interceptors.'),
};

export const setAuthDataForInterceptors = (logoutFn, navigateFn) => {
    authDataForInterceptors.logout = logoutFn;
    authDataForInterceptors.navigate = navigateFn;
};


// 1. Crea una instancia de Axios
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // URL base de tu backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor de Solicitudes (Request Interceptor)
//    Este interceptor se ejecutará ANTES de que cada solicitud salga de tu aplicación.
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken'); // Obtiene el token del localStorage

        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Adjunta el token al encabezado
        }
        return config; // Devuelve la configuración modificada
    },
    (error) => {
        return Promise.reject(error); // Si hay un error antes de enviar, lo propaga
    }
);

// 3. Interceptor de Respuestas (Response Interceptor)
//    Este interceptor se ejecutará DESPUÉS de que cada respuesta llegue a tu aplicación.
apiClient.interceptors.response.use(
    (response) => {
        return response; // Si la respuesta es exitosa, la devuelve directamente
    },
    (error) => {
        // Si la respuesta es un error
        if (error.response) {
            const { status } = error.response;

            // Manejo específico para el error 401 (Unauthorized)
            if (status === 401) {
                // Podría ser token expirado o inválido
                console.error('Error 401: Token expirado o inválido. Redirigiendo a login.');
                toast.error('Tu sesión ha expirado o es inválida. Por favor, inicia sesión de nuevo.');

                // Usa la función de logout y navigate que se inyectaron
                authDataForInterceptors.logout();
                authDataForInterceptors.navigate('/login');

                // Evita que la promesa del error se propague, ya que ya manejamos la redirección
                return Promise.reject(error);
            }

            // Manejo de otros errores comunes
            if (status === 403) {
                toast.error('No tienes permiso para realizar esta acción.');
            } else if (status >= 500) {
                toast.error('Ha ocurrido un error en el servidor. Inténtalo de nuevo más tarde.');
            } else if (status >= 400 && status < 500) {
                // Para otros errores del cliente (ej. 400 Bad Request, 404 Not Found)
                const errorMessage = error.response.data?.message || 'Error en la solicitud.';
                toast.error(errorMessage);
            }
        } else if (error.request) {
            // Error de red: La solicitud fue hecha pero no se recibió respuesta
            toast.error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        } else {
            // Algo más causó el error (ej. error en la configuración de Axios)
            toast.error('Ha ocurrido un error inesperado.');
        }

        return Promise.reject(error); // Propaga el error para que el componente que hizo la llamada lo maneje también si es necesario
    }
);

export default apiClient; // Exporta la instancia configurada de Axios