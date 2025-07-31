// src/components/dashboard/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useNavigate, Outlet, Link, Navigate } from 'react-router-dom';
import {
    FiHome, FiUsers, FiBarChart, FiFileText, FiUser, FiLogOut,
    FiChevronDown, FiMenu, FiBell // Importa el icono de campana para notificaciones
} from 'react-icons/fi';
import { getFriendlyRoleName } from '../utils/roleUtils.js';

const DashboardPage = () => {
    const { user, logout, role, isLoading } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el dropdown si se hace clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
                Cargando dashboard...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userInitials = user.firstName && user.lastName
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        : user.username
            ? user.username.charAt(0).toUpperCase()
            : 'US';

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar para pantallas grandes */}
            <aside
                className={`
                    w-64 bg-gray-800 dark:bg-gray-900 text-white flex-shrink-0
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:relative absolute inset-y-0 left-0 z-30
                `}
            >
                <div className="p-6">
                    {/* Espacio para el Logo de la Empresa */}
                    <div className="mb-8 flex justify-center items-center">
                        {/* Puedes usar una etiqueta img si tienes el logo, o un div con un icono */}
                        <img
                            src="/src/assets/LogoEmpresa1.png" // **Asegúrate de poner la ruta correcta de tu logo**
                            alt="Logo de la Empresa"
                            className="h-16 w-auto" // Ajusta el tamaño según tu logo
                        />
                        {/* O si prefieres solo texto con un estilo de logo: */}
                        {/* <span className="text-3xl font-extrabold text-blue-400">Mi Empresa</span> */}
                    </div>
                    {/* <h1 className="text-3xl font-extrabold text-blue-400 mb-8 text-center">
                        Sistema Admin // Este ya no es necesario si usas un logo
                    </h1> */}
                    <nav className="space-y-3">
                        {/* Elementos de navegación condicionales */}
                        <Link to="/dashboard" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                            <FiHome className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                            <span className="font-medium">Inicio</span>
                        </Link>

                        {(role === 'ROLE_ADMIN' || role === 'ROLE_SUPERVISOR') && (
                            <Link to="/dashboard/users" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                                <FiUsers className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium">Usuarios</span>
                            </Link>
                        )}

                        {(role === 'ROLE_ADMIN' || role === 'ROLE_SUPERVISOR') && (
                            <Link to="/dashboard/reports" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                                <FiBarChart className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium">Reportes</span>
                            </Link>
                        )}

                        {role === 'ROLE_ADMIN' && (
                            <Link to="/dashboard/logs" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                                <FiFileText className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                                <span className="font-medium">Logs</span>
                            </Link>
                        )}

                        <Link to="/dashboard/profile" className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-gray-700 dark:hover:bg-gray-800 transition duration-200 group">
                            <FiUser className="mr-3 text-lg group-hover:text-blue-400 transition-colors" />
                            <span className="font-medium">Perfil</span>
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Overlay para el sidebar en móviles */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Contenido principal */}
            <div className="flex-grow flex flex-col">
                {/* Navbar para pantallas grandes y botón de menú para móviles */}
                <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center z-20">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
                    >
                        <FiMenu className="text-2xl" />
                    </button>
                    <div className="text-xl font-extrabold text-gray-600 dark:text-gray-100 md:block hidden">
                        Sistema de Gestion de Usuarios y Roles
                    </div>

                    {/* Ícono de Notificaciones y User Avatar / Dropdown */}
                    <div className="flex items-center space-x-4">
                        {/* Ícono de Notificaciones */}
                        <button className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
                            <FiBell className="text-2xl" />
                            {/* Opcional: Indicador de notificaciones nuevas */}
                            {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span> */}
                        </button>

                        {/* User Avatar / Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 focus:outline-none"
                            >
                                <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                                    {userInitials}
                                </div>
                                <span className="hidden md:block text-gray-800 dark:text-gray-100 font-medium">{user.firstName}</span>
                                <FiChevronDown className={`text-gray-500 dark:text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-40">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-600">
                                        <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
                                        <p className="text-blue-500 dark:text-blue-400 text-xs mt-1">{getFriendlyRoleName(role)}</p>
                                    </div>
                                    <Link to="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                                        <FiUser className="mr-2" /> Mi Perfil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        <FiLogOut className="mr-2" /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Área de contenido dinámico */}
                <main className="flex-grow p-6 bg-gray-100 dark:bg-gray-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;