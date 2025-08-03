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
        // Contenedor principal del dashboard - Asegura que ocupe al menos toda la altura de la pantalla
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar para pantallas grandes y móviles */}
            <aside
                className={`
        fixed md:relative
        top-0 left-0 z-30
        w-64 h-[100dvh]
        bg-gray-800 dark:bg-gray-900 text-white
        flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        overflow-y-auto
    `}
            >
                <div className="p-6">
                    <div className="mb-8 flex justify-center items-center">
                        <img
                            src="/src/assets/LogoEmpresa1.png"
                            alt="Logo de la Empresa"
                            className="h-16 w-auto"
                        />
                    </div>
                    <nav className="space-y-3">
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
                    className="fixed inset-0 bg-black opacity-20 z-20 md:hidden" // <--- Z-index es importante aquí
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Contenido principal - Asegúrate de que crezca para ocupar el espacio restante */}
            <div className="flex-grow flex flex-col"> {/* Este div ya tiene flex-grow */}
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
                        <button className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none">
                            <FiBell className="text-2xl" />
                        </button>

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
                <main className="flex-grow p-6 bg-gray-100 dark:bg-gray-900 overflow-y-auto"> {/* <--- Opcional: para contenido largo */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;