import React from 'react';

const AdminDashboardPage = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#e0ffe0' }}>
            <h2>Panel de Administrador</h2>
            <p>Aquí solo los administradores tienen acceso.</p>
            <button onClick={() => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                window.location.href = '/login'; // Redirige a login al cerrar sesión
            }}>Cerrar Sesión</button>
        </div>
    );
};

export default AdminDashboardPage;