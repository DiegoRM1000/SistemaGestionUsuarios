import React, { useState, useEffect } from 'react';
import {
    FiEdit,
    FiTrash2,
    FiToggleLeft,
    FiToggleRight,
    FiDownload,
    FiSearch
} from 'react-icons/fi';
import DataTable from 'react-data-table-component';
import { getRoleColor } from '../../utils/roleUtils';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// Importamos el hook de autenticación para obtener el token
import { useAuth } from '../../context/AuthContext';


// Componente para el loader
const Loader = () => (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="mt-4 text-lg font-medium">Cargando usuarios...</span>
    </div>
);

// Componente para la tabla de gestión de usuarios
const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState('');
    const MySwal = withReactContent(Swal);
    // Usamos el hook useAuth para acceder a la información de autenticación y el token
    const { token } = useAuth();

    // Función para obtener los datos de los usuarios del backend
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Verificar si el token existe antes de hacer la llamada a la API
            if (!token) {
                console.error("No se encontró el token de autenticación.");
                MySwal.fire({
                    icon: 'error',
                    title: 'Error de Autenticación',
                    text: 'No se pudo cargar el token de autenticación. Por favor, inicie sesión de nuevo.',
                });
                return;
            }

            // Realizamos la llamada a la API real
            const response = await fetch('http://localhost:8080/api/users/all', {
                headers: {
                    // CORRECCIÓN: Usamos backticks para el template literal
                    'Authorization': `Bearer ${token}`
                }
            });

            // Si la respuesta no es exitosa, lanzamos un error con el estado
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error("Acceso denegado. No tienes los permisos necesarios (ADMIN o SUPERVISOR).");
                }
                const errorText = await response.text();
                console.error("Error al cargar los usuarios:", response.status, errorText);
                throw new Error(`Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            // CORRECCIÓN CLAVE: El backend ya devuelve el objeto 'role' en el formato correcto,
            // por lo que no necesitamos mapearlo. Lo usamos directamente.
            setUsers(data);

        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
            let errorMessage = 'Hubo un error al cargar los datos. Por favor, intente de nuevo.';
            if (error.message.includes('403')) {
                errorMessage = 'Acceso denegado. No tienes permisos para ver esta página.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Autenticación fallida. Por favor, inicie sesión de nuevo.';
            } else if (error.message.includes('No se encontró el token')) {
                errorMessage = 'No se pudo cargar el token de autenticación. Por favor, inicie sesión de nuevo.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica que el backend esté corriendo en http://localhost:8080.';
            }

            MySwal.fire({
                icon: 'error',
                title: 'Error de la API',
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    // useEffect para cargar los usuarios al montar el componente, ahora con una dependencia del token
    useEffect(() => {
        // Solo intentamos cargar los usuarios si ya tenemos un token
        if (token) {
            fetchUsers();
        } else {
            setLoading(false); // Si no hay token, no cargamos y mostramos la tabla vacía.
        }
    }, [token]); // El efecto se vuelve a ejecutar cuando el token cambia

    // Lógica para filtrar los usuarios
    const filteredUsers = users.filter(user => {
        const searchText = filterText.toLowerCase();
        // user.role.name ya existe y es un string, así que la llamada es correcta
        const roleName = user.role?.name?.toLowerCase() || '';
        return (
            user.firstName?.toLowerCase().includes(searchText) ||
            user.lastName?.toLowerCase().includes(searchText) ||
            user.email?.toLowerCase().includes(searchText) ||
            roleName.includes(searchText)
        );
    });

    // --- Funciones de manejo de acciones (con llamadas a API reales) ---
    const handleEdit = (id) => {
        console.log(`Editar usuario con ID: ${id}`);
        MySwal.fire({
            title: 'Editar Usuario',
            text: `Funcionalidad de edición para el usuario con ID: ${id}.`,
            icon: 'info',
            confirmButtonText: 'Aceptar'
        });
    };

    const handleDelete = (id) => {
        MySwal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, ¡elimínalo!',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Llamada real a la API para eliminar
                    const response = await fetch(`http://localhost:8080/api/users/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error("Acceso denegado. No tienes los permisos necesarios (ADMIN o SUPERVISOR).");
                        }
                        throw new Error(`Error ${response.status}`);
                    }

                    // Actualizar el estado local después de la eliminación exitosa
                    setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
                    MySwal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');

                } catch (error) {
                    console.error("Error al eliminar usuario:", error);
                    MySwal.fire('Error', error.message, 'error');
                }
            }
        });
    };

    const handleToggleStatus = (id) => {
        MySwal.fire({
            title: '¿Cambiar estado?',
            text: "El estado de la cuenta del usuario será modificado.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cambiar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Llamada real a la API para cambiar el estado
                    const response = await fetch(`http://localhost:8080/api/users/${id}/toggle-status`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error("Acceso denegado. No tienes los permisos necesarios (ADMIN o SUPERVISOR).");
                        }
                        throw new Error(`Error ${response.status}`);
                    }

                    // Obtener el usuario actualizado de la respuesta del backend
                    const updatedUser = await response.json();

                    // Actualizar el estado local con el usuario actualizado
                    setUsers(prevUsers =>
                        prevUsers.map(user =>
                            user.id === updatedUser.id ? { ...user, enabled: updatedUser.enabled } : user
                        )
                    );
                    MySwal.fire('¡Estado actualizado!', `El estado del usuario ha sido cambiado.`, 'success');

                } catch (error) {
                    console.error("Error al cambiar estado:", error);
                    MySwal.fire('Error', error.message, 'error');
                }
            }
        });
    };

    // Lógica de exportación a CSV
    const handleExportCsv = () => {
        const headers = ["ID", "Nombre", "Apellido", "Email", "Rol", "Estado"];
        const rows = filteredUsers.map(user => [
            user.id,
            user.firstName,
            user.lastName,
            user.email,
            user.role?.name || 'Sin rol',
            user.enabled ? "Activo" : "Inactivo"
        ]);
        const csvContent = [
            headers.join(','),
            ...rows.map(e => e.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'usuarios.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        { name: 'ID', selector: row => row.id, sortable: true, width: '80px' },
        { name: 'Nombre', selector: row => row.firstName, sortable: true },
        { name: 'Apellido', selector: row => row.lastName, sortable: true },
        { name: 'Email', selector: row => row.email, sortable: true },
        {
            name: 'Rol',
            selector: row => row.role?.name,
            sortable: true,
            cell: row => (
                <span
                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                    style={{ backgroundColor: getRoleColor(row.role?.name) }}
                >
                {row.role?.name || 'Sin Rol'}
            </span>
            ),
        },
        {
            name: 'Estado',
            selector: row => row.enabled,
            sortable: true,
            cell: row => (
                <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${row.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}
                >
                {row.enabled ? 'Activo' : 'Inactivo'}
            </span>
            ),
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="flex space-x-2">
                    <button
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-600 transition duration-150 ease-in-out transform hover:scale-110"
                        onClick={() => handleEdit(row.id)}
                        aria-label={`Editar usuario ${row.firstName}`}
                    >
                        <FiEdit className="h-5 w-5" />
                    </button>
                    <button
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600 transition duration-150 ease-in-out transform hover:scale-110"
                        onClick={() => handleDelete(row.id)}
                        aria-label={`Eliminar usuario ${row.firstName}`}
                    >
                        <FiTrash2 className="h-5 w-5" />
                    </button>
                    <button
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-600 transition duration-150 ease-in-out transform hover:scale-110"
                        onClick={() => handleToggleStatus(row.id)}
                        aria-label={`Alternar estado de usuario ${row.firstName}`}
                    >
                        {row.enabled ? <FiToggleLeft className="h-5 w-5" /> : <FiToggleRight className="h-5 w-5" />}
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            // Propiedades transitorias corregidas
            $allowOverflow: true,
            $button: true,
            width: '150px'
        },
    ];


    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen font-sans antialiased">
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    Gestión de Usuarios
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Administra los usuarios y sus roles en el sistema de manera eficiente.
                </p>
            </header>

            {/* Controles de la tabla */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="relative w-full sm:w-1/3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white shadow-sm transition-colors"
                    />
                </div>
                <button
                    onClick={handleExportCsv}
                    className="flex items-center px-6 py-2.5 rounded-lg shadow-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <FiDownload className="mr-2 h-5 w-5" />
                    Exportar a CSV
                </button>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={{
                        header: {
                            style: {
                                backgroundColor: '#f8f9fa',
                                color: '#495057',
                                padding: '16px',
                                borderBottom: '1px solid #dee2e6'
                            },
                        },
                        subHeader: {
                            style: {
                                padding: '16px',
                                borderBottom: '1px solid #dee2e6'
                            },
                        },
                        headRow: {
                            style: {
                                backgroundColor: '#f8f9fa',
                                color: '#495057',
                                fontSize: '1rem',
                                fontWeight: 'bold'
                            },
                        },
                        cells: {
                            style: {
                                '&:not(:last-of-type)': {
                                    borderRight: '1px solid #dee2e6',
                                },
                                padding: '16px'
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default UserManagementPage;
