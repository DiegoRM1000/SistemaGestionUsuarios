import React from 'react';

const DashboardPage = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Bienvenido al Dashboard General</h2>
            <p>Esta es una página accesible para todos los usuarios autenticados.</p>
            <button onClick={() => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                window.location.href = '/login'; // Redirige a login al cerrar sesión
            }}>Cerrar Sesión</button>
        </div>
    );
};

export default DashboardPage;