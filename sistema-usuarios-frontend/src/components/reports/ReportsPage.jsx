// src/components/reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axiosConfig';
import { FiUsers, FiUserCheck, FiUserX, FiCalendar } from 'react-icons/fi';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';

// Registra los componentes de Chart.js que usarás
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

const ReportsPage = () => {
    const [summary, setSummary] = useState(null);
    const [usersByRole, setUsersByRole] = useState(null);
    const [monthlyRegistrations, setMonthlyRegistrations] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const [summaryResponse, usersByRoleResponse, monthlyRegistrationsResponse] = await Promise.all([
                    apiClient.get('/reports/summary'),
                    apiClient.get('/reports/users-by-role'),
                    apiClient.get('/reports/monthly-registrations')
                ]);
                setSummary(summaryResponse.data);
                setUsersByRole(usersByRoleResponse.data);
                setMonthlyRegistrations(monthlyRegistrationsResponse.data);
            } catch (error) {
                console.error("Error al obtener los datos de los reportes:", error);
                toast.error("No se pudieron cargar los datos de los reportes.");
            } finally {
                setLoading(false);
            }
        };
        fetchReportData();
    }, []);

    // Formatear el nombre del mes
    const getMonthName = (monthNumber) => {
        const date = new Date();
        date.setMonth(monthNumber - 1);
        return date.toLocaleString('es-ES', { month: 'long' });
    };

    // FUNCIÓN PARA MANEJAR LA EXPORTACIÓN DE ARCHIVOS
    const handleExport = async (type) => {
        try {
            const url = type === 'pdf' ? '/reports/export/pdf' : '/reports/export/excel';
            const fileName = type === 'pdf' ? 'reporte_usuarios.pdf' : 'reporte_usuarios.xlsx';

            const response = await apiClient.get(url, {
                responseType: 'blob', // Importante para manejar archivos binarios
            });

            // Crear un enlace temporal para la descarga
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl); // Liberar memoria

            toast.success(`Reporte exportado como ${type.toUpperCase()} con éxito. 🎉`);
        } catch (error) {
            console.error('Error al exportar el reporte:', error);
            const errorMessage = error.response?.data?.message || 'Error al exportar. Asegúrate de ser administrador.';
            toast.error(errorMessage);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <span className="text-lg text-gray-500 dark:text-gray-400">Cargando reportes...</span>
            </div>
        );
    }

    if (!summary || !usersByRole || !monthlyRegistrations) {
        return (
            <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 font-sans antialiased">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Reportes del Sistema</h1>
                <p className="text-center text-gray-500 dark:text-gray-400">
                    No se pudieron cargar los datos de los reportes.
                </p>
            </div>
        );
    }

    // Preparar datos para el gráfico de pastel (Usuarios por Rol)
    const roleNames = Object.keys(usersByRole);
    const roleCounts = Object.values(usersByRole);
    const totalUsers = roleCounts.reduce((sum, count) => sum + count, 0);

    const pieChartData = {
        labels: roleNames.map(name => `${name} (${((usersByRole[name] / totalUsers) * 100).toFixed(1)}%)`),
        datasets: [
            {
                label: 'Usuarios por Rol',
                data: roleCounts,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)', // ADMIN
                    'rgba(255, 159, 64, 0.6)', // EMPLEADO
                    'rgba(54, 162, 235, 0.6)', // SUPERVISOR
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Preparar datos para el gráfico de barras (Registros Mensuales)
    const monthlyLabels = monthlyRegistrations.map(row => `${getMonthName(row[0])} ${row[1]}`);
    const monthlyData = monthlyRegistrations.map(row => row[2]);

    const barChartData = {
        labels: monthlyLabels,
        datasets: [{
            label: 'Nuevos Usuarios',
            data: monthlyData,
            backgroundColor: 'rgba(139, 92, 246, 0.6)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1,
        }]
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 font-sans antialiased min-h-screen">
            <header className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Reportes del Sistema</h1>
            </header>

            {/* Sección de Paneles de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Panel de Usuarios Totales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total de Usuarios</h2>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">{summary.totalUsers}</p>
                    </div>
                    <FiUsers size={48} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                {/* Panel de Usuarios Activos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Usuarios Activos</h2>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">{summary.activeUsers}</p>
                    </div>
                    <FiUserCheck size={48} className="text-green-600 dark:text-green-400" />
                </div>
                {/* Panel de Usuarios Inactivos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Usuarios Inactivos</h2>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">{summary.inactiveUsers}</p>
                    </div>
                    <FiUserX size={48} className="text-red-600 dark:text-red-400" />
                </div>
                {/* Panel de Registros Mensuales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-500 dark:text-gray-400">Registros del Mes</h2>
                        <p className="text-4xl font-bold text-gray-900 dark:text-white">
                            {monthlyRegistrations.length > 0 ? monthlyRegistrations[monthlyRegistrations.length - 1][2] : 0}
                        </p>
                    </div>
                    <FiCalendar size={48} className="text-yellow-600 dark:text-yellow-400" />
                </div>
            </div>

            {/* Sección de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Gráfico de Usuarios por Rol */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Distribución de Usuarios por Rol</h2>
                    <div className="h-96 flex items-center justify-center">
                        <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
                {/* Gráfico de Registros Mensuales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Registros de Usuarios (Mensual)</h2>
                    <div className="h-96 flex items-center justify-center">
                        <Bar data={barChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Tabla Detallada con Totales por Rol */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resumen Detallado por Rol</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Rol
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Total de Usuarios
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Porcentaje
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {roleNames.map((roleName, index) => (
                            <tr key={roleName}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {roleName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {roleCounts[index]}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {((roleCounts[index] / totalUsers) * 100).toFixed(2)}%
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Funcionalidad para exportar */}
            <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                <button
                    onClick={() => handleExport('pdf')}
                    className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-red-600 hover:bg-red-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Exportar a PDF
                </button>
                <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Exportar a Excel
                </button>
            </div>
        </div>
    );
};

export default ReportsPage;