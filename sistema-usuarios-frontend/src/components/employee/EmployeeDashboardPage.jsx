import React from 'react';

const EmployeeDashboardPage = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#ffe0e0' }}>
            <h2>Panel de Empleado</h2>
            <p>Esta es tu área de trabajo como empleado.</p>
            <button onClick={() => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                window.location.href = '/login'; // Redirige a login al cerrar sesión
            }}>Cerrar Sesión</button>
        </div>
    );
};

export default EmployeeDashboardPage;