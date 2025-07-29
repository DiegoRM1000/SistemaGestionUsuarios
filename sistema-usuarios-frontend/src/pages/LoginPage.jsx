import { useState } from 'react';
import axios from 'axios';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // Importa los íconos de ojo
import { useNavigate } from 'react-router-dom'; // ¡Importa useNavigate!

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para la visibilidad de la contraseña
    const [notification, setNotification] = useState(null); // Estado para las notificaciones: { message, type, key }

    const navigate = useNavigate(); // ¡Inicializa useNavigate!

    const handleLogin = async (e) => {
        e.preventDefault();
        setNotification(null); // Limpiar notificación anterior antes de un nuevo intento

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email,
                password,
            });

            // --- INICIO DE MODIFICACIÓN CLAVE ---
            // El backend ahora envía { accessToken, tokenType, role }
            const { accessToken, role } = response.data;

            // Guarda el token en el almacenamiento local
            localStorage.setItem('jwtToken', accessToken);

            // ¡NUEVO! Guarda el rol del usuario en el almacenamiento local
            localStorage.setItem('userRole', role);

            console.log('Login exitoso!', accessToken);
            console.log('Rol del usuario:', role); // Verifica que el rol se muestre en consola
            // --- FIN DE MODIFICACIÓN CLAVE ---

            setNotification({ message: '¡Inicio de sesión exitoso!', type: 'success', key: Date.now() });

            // TODO: Aquí irá la lógica para redirigir al usuario al dashboard basada en el rol
            // Por ejemplo, con React Router DOM: navigate('/dashboard');

            // --- Lógica de redirección basada en rol ---
            if (role === 'ROLE_ADMIN') {
                navigate('/admin-dashboard');
            } else if (role === 'ROLE_EMPLOYEE') {
                navigate('/employee-dashboard');
            } else {
                // Para cualquier otro rol o rol por defecto
                navigate('/dashboard');
            }
            // --- Fin lógica de redirección ---

        } catch (error) {
            console.error('Login fallido:', error.response?.data || error.message);
            setNotification({
                message: `Error de inicio de sesión: ${error.response?.data?.message || 'Credenciales inválidas.'}`,
                type: 'error',
                key: Date.now(),
            });
        }
    };

    return (
        <div
            className="
                p-7
                max-w-sm
                sm:max-w-md
                md:max-w-lg
                w-full
                border
                border-gray-700
                rounded-2xl
                shadow-2xl
                bg-white/90
                backdrop-blur-md
                overflow-hidden
                animate-fade-in
            "
        >
            <div className="text-center mb-10 bg-gray-300 rounded-xl p-4 ">
                <h2 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Bienvenido al Sistema
                </h2>
                <p className="text-lg text-gray-700">
                    Inicia sesión en tu cuenta
                </p>
            </div>

            {notification && (
                <div
                    key={notification.key}
                    className={`
                        p-4 mb-6 rounded-lg font-medium text-center relative overflow-hidden
                        ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
                        shadow-lg
                        transform translate-y-0 opacity-100 transition-all duration-300 ease-in-out
                    `}
                >
                    <div
                        className={`absolute inset-0 opacity-20
                            ${notification.type === 'success' ? 'bg-green-700' : 'bg-red-700'}
                            transform scale-x-0 origin-left animate-notification-fill
                        `}
                    ></div>
                    <span className="relative z-10">{notification.message}</span>
                </div>
            )}

            <div className="my-6 text-left">
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-800 text-base font-semibold mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Ingresa tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="
                                shadow-sm
                                appearance-none
                                border
                                border-gray-300
                                rounded-xl
                                w-full
                                py-3
                                px-4
                                text-gray-900
                                leading-tight
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-600
                                focus:border-transparent
                                transition-all
                                duration-200
                                placeholder-gray-500
                            "
                            required
                        />
                    </div>

                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-gray-800 text-base font-semibold mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="
                                shadow-sm
                                appearance-none
                                border
                                border-gray-300
                                rounded-xl
                                w-full
                                py-3
                                px-4
                                pr-10
                                text-gray-900
                                leading-tight
                                focus:outline-none
                                focus:ring-2
                                focus:ring-blue-600
                                focus:border-transparent
                                transition-all
                                duration-200
                                placeholder-gray-500
                            "
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="
                                absolute
                                inset-y-0
                                right-0
                                pr-3
                                flex
                                items-center
                                text-sm
                                leading-5
                                text-gray-600
                                hover:text-gray-900
                                focus:outline-none
                                transition-colors
                                duration-200
                                mt-8
                            "
                        >
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                        </button>
                    </div>

                    <div className="text-right mb-8">
                        <a
                            href="#"
                            className="
                                inline-block
                                align-baseline
                                font-medium
                                text-sm
                                text-blue-600
                                hover:text-blue-800
                                hover:underline
                                transition-colors
                                duration-200
                            "
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <div className="flex items-center justify-between mt-6">
                        <button
                            type="submit"
                            className="
                                bg-blue-700
                                hover:bg-blue-800
                                text-white
                                font-bold
                                py-3.5
                                px-6
                                rounded-xl
                                focus:outline-none
                                focus:shadow-outline
                                focus:ring-2
                                focus:ring-blue-600
                                focus:ring-opacity-75
                                w-full
                                transition-all
                                duration-300
                                ease-in-out
                                transform
                                active:scale-95
                                animate-button-press
                            "
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;