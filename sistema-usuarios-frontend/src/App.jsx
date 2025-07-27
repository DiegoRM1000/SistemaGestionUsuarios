import LoginPage from './pages/LoginPage';

function App() {
    return (
        <div
            className="
        min-h-screen            // Asegura que ocupe toda la altura de la pantalla
        flex                    // Usa Flexbox para centrar contenido
        items-center            // Centra verticalmente
        justify-center          // Centra horizontalmente
        bg-gray-900             // Color de fondo de respaldo
        bg-cover                // La imagen de fondo cubrirá todo el contenedor
        bg-center               // Centra la imagen de fondo
        bg-no-repeat            // Evita que la imagen se repita
        relative                // Necesario para posicionar el overlay absoluto
      "
            style={{backgroundImage: "url('/src/assets/FondoLogin.jpg')"}} // <-- Ruta de tu imagen de fondo
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

export default App;