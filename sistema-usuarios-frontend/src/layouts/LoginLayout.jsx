import React from 'react';
import LoginPage from '../pages/LoginPage'; // Ajusta la ruta si es necesario

function LoginLayout() {
    return (
        <div
            className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-gray-900
            bg-cover
            bg-center
            bg-no-repeat
            relative
          "
            style={{backgroundImage: "url('/src/assets/FondoLogin.jpg')"}} // <-- Tu imagen de fondo
        >
            {/* Overlay oscuro para mejorar la legibilidad del formulario */}
            <div className="absolute inset-0 bg-black opacity-60"></div>

            {/* Contenedor para LoginPage, encima del overlay */}
            <div className="relative z-10">
                <LoginPage />
            </div>
        </div>
    );
}

export default LoginLayout;