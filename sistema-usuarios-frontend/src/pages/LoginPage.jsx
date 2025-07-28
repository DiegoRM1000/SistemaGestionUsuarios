import {useState} from 'react';
import axios from 'axios';
import {FiEye, FiEyeOff} from 'react-icons/fi'; // Importa los íconos de ojo

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // Estado para la visibilidad de la contraseña
    const [notification, setNotification] = useState(null); // Estado para las notificaciones: { message, type, key }

    const handleLogin = async (e) => {
        e.preventDefault();
        setNotification(null); // Limpiar notificación anterior antes de un nuevo intento

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                email, // Enviamos 'email'
                password,
            });

            const {token} = response.data;
            localStorage.setItem('jwtToken', token); // Guarda el token en el almacenamiento local
            console.log('Login exitoso!', token);

            // Muestra una notificación de éxito con una nueva 'key' para forzar la animación
            setNotification({message: '¡Inicio de sesión exitoso!', type: 'success', key: Date.now()});

            // TODO: Aquí irá la lógica para redirigir al usuario al dashboard
            // Por ejemplo, con React Router DOM: navigate('/dashboard');

        } catch (error) {
            console.error('Login fallido:', error.response?.data || error.message);
            // Muestra una notificación de error con una nueva 'key' para forzar la animación
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
        p-7             /* Padding interno */
        max-w-sm          /* Ancho máximo predeterminado para móviles */
        sm:max-w-md       /* Ancho máximo en pantallas pequeñas/medianas */
        md:max-w-lg       /* Ancho máximo en pantallas medianas y grandes */
        w-full          /* Ocupa todo el ancho disponible hasta el max-w */
        border          /* Borde delgado */
        border-gray-700 /* Color del borde */
        rounded-2xl     /* Bordes más redondeados */
        shadow-2xl      /* Sombra pronunciada para efecto flotante */
        bg-white/90     /* Fondo blanco semi-transparente (90% opacidad) */
        backdrop-blur-md /* Efecto de desenfoque en el fondo */
        overflow-hidden /* Asegura que las esquinas redondeadas se vean bien */
        animate-fade-in /* Animación de aparición al cargar la página */
      "
        >
            {/* Título y subtítulo del formulario */}
            <div className="text-center mb-10 bg-gray-300 rounded-xl p-4 ">
                <h2 className="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    Bienvenido al Sistema
                </h2>
                <p className="text-lg text-gray-700">
                    Inicia sesión en tu cuenta
                </p>
            </div>

            {/* --- Notificación de Éxito/Error --- */}
            {notification && (
                <div
                    // 'key' única para forzar a React a re-montar el componente y reiniciar la animación
                    key={notification.key}
                    className={`
            p-4 mb-6 rounded-lg font-medium text-center relative overflow-hidden
            ${notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
            shadow-lg
            transform translate-y-0 opacity-100 transition-all duration-300 ease-in-out
          `}
                    // Aquí no usamos animate-fade-in porque la animación interna 'notification-fill' es la clave
                >
                    {/* Barra animada de fondo para la notificación */}
                    <div
                        className={`absolute inset-0 opacity-20
              ${notification.type === 'success' ? 'bg-green-700' : 'bg-red-700'}
              transform scale-x-0 origin-left animate-notification-fill /* Animación de llenado rápido */
            `}
                    ></div>
                    <span className="relative z-10">{notification.message}</span> {/* El texto de la notificación */}
                </div>
            )}

            {/* Formulario de Login */}
            <div className="my-6 text-left">
                <form onSubmit={handleLogin}>
                    {/* Campo de Correo Electrónico */}
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-800 text-base font-semibold mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email" // Tipo "email" para validación básica del navegador
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

                    {/* Campo de Contraseña con Mostrar/Ocultar */}
                    <div className="mb-4 relative"> {/* 'relative' es crucial para posicionar el botón de alternar */}
                        <label htmlFor="password" className="block text-gray-800 text-base font-semibold mb-2">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'} // Alterna el tipo para mostrar/ocultar
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
                pr-10               /* Añadir espacio a la derecha para el ícono/botón */
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
                        {/* Botón para Mostrar/Ocultar Contraseña con ícono */}
                        <button
                            type="button" // ¡Importante! Evita que este botón envíe el formulario
                            onClick={() => setShowPassword(!showPassword)}
                            className="
                absolute         /* Posición absoluta dentro del div 'relative' */
                inset-y-0        /* Se estira verticalmente para centrar el ícono */
                right-0          /* Alinea a la derecha */
                pr-3             /* Padding derecho para separar el ícono del borde */
                flex             /* Usa flexbox para centrar el ícono dentro del botón */
                items-center     /* Centra el ícono verticalmente */
                text-sm
                leading-5
                text-gray-600
                hover:text-gray-900 /* Cambia de color al pasar el ratón */
                focus:outline-none
                transition-colors
                duration-200
                mt-8             /* Ajuste de margen superior para alinear con el input */
              "
                        >
                            {showPassword ? <FiEyeOff size={20}/> : <FiEye size={20}/>} {/* Renderiza el ícono */}
                        </button>
                    </div>

                    {/* Enlace de Olvidé mi Contraseña */}
                    <div className="text-right mb-8">
                        <a
                            href="#" // Por ahora, un simple '#' como marcador de posición
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

                    {/* Botón de Iniciar Sesión */}
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
                active:scale-95       /* Animación de encoger al hacer clic */
                animate-button-press  /* Animación de presión definida en tailwind.config.js */
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