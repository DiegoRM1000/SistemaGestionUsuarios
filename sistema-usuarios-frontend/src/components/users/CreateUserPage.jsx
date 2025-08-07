import React, { useState, useEffect } from 'react';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import apiClient from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const CreateUserPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        dni: '',
        dateOfBirth: '',
        phoneNumber: '',
        role: 'EMPLEADO', // Valor por defecto
    });
    const [roles, setRoles] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                // CORRECCIÓN CLAVE: El endpoint correcto es '/roles/all'
                const response = await apiClient.get('/roles/all');
                setRoles(response.data);
            } catch (error) {
                console.error("Error al obtener los roles:", error);
                toast.error("No se pudieron cargar los roles del sistema.");
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/users/create', formData);
            toast.success('¡Usuario creado con éxito!');
            navigate('/dashboard/users'); // CORRECCIÓN: La ruta correcta para el listado es /dashboard/users
        } catch (error) {
            console.error('Error al crear usuario:', error);
            const errorMessage = error.response?.data?.message || 'Error al crear usuario. Verifica los datos.';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="p-4 sm:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen font-sans antialiased">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Crear Nuevo Usuario</h1>
                <button
                    onClick={() => navigate('/dashboard/users')}
                    className="flex items-center justify-center px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                >
                    <FiArrowLeft className="mr-2" /> Volver
                </button>
            </header>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ... (campos del formulario) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de Usuario</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI</label>
                        <input type="text" name="dni" value={formData.dni} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Nacimiento</label>
                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                        <select name="role" value={formData.role} onChange={handleChange} required className="input-field">
                            {loadingRoles ? (
                                <option>Cargando roles...</option>
                            ) : (
                                roles.map(role => (
                                    <option key={role.id} value={role.name}>{role.name}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
                        <button
                            type="submit"
                            className="flex items-center justify-center px-6 py-2.5 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <FiSave className="mr-2" /> Guardar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateUserPage;