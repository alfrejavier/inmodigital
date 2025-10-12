const { propietario } = require('../models');

/**
 * Controlador para la gestión de propietarios
 */
class PropietarioController {

    /**
     * Obtener todos los propietarios
     */
    async obtenerTodos(req, res) {
        try {
            const { page = 1, limit = 50, search, buscar } = req.query;
            
            let propietarios;
            
            // Usar 'search' (del frontend) o 'buscar' (compatibilidad)
            const terminoBusqueda = search || buscar;
            
            if (terminoBusqueda && terminoBusqueda.trim()) {
                propietarios = await propietario.buscarPorNombre(terminoBusqueda.trim());
            } else {
                const offset = (page - 1) * limit;
                propietarios = await propietario.findAll({}, 'nombre ASC', limit);
            }

            res.json({
                success: true,
                data: propietarios,
                total: propietarios.length,
                page: parseInt(page),
                limit: parseInt(limit)
            });

        } catch (error) {
            console.error('Error al obtener propietarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener un propietario por documento
     */
    async obtenerPorDocumento(req, res) {
        try {
            const { documento } = req.params;
            
            const propietarioEncontrado = await propietario.findById(parseInt(documento));
            
            if (!propietarioEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró propietario con documento ${documento}`
                });
            }

            // Obtener propiedades del propietario
            const propiedades = await propietario.obtenerPropiedades(parseInt(documento));
            
            res.json({
                success: true,
                data: {
                    ...propietarioEncontrado,
                    propiedades
                }
            });

        } catch (error) {
            console.error('Error al obtener propietario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear un nuevo propietario
     */
    async crear(req, res) {
        try {
            const nuevoPropietario = await propietario.crear(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Propietario creado exitosamente',
                data: nuevoPropietario
            });

        } catch (error) {
            console.error('Error al crear propietario:', error);
            
            // Manejar errores de validación
            if (error.message.includes('requerido') || 
                error.message.includes('Ya existe') ||
                error.message.includes('debe ser')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar un propietario
     */
    async actualizar(req, res) {
        try {
            const { documento } = req.params;
            
            const propietarioActualizado = await propietario.actualizar(parseInt(documento), req.body);
            
            res.json({
                success: true,
                message: 'Propietario actualizado exitosamente',
                data: propietarioActualizado
            });

        } catch (error) {
            console.error('Error al actualizar propietario:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('requerido') || error.message.includes('debe ser')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar un propietario
     */
    async eliminar(req, res) {
        try {
            const { documento } = req.params;
            
            // Verificar que no tenga propiedades asociadas
            const propiedades = await propietario.obtenerPropiedades(parseInt(documento));
            
            if (propiedades.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el propietario porque tiene propiedades asociadas'
                });
            }

            const eliminado = await propietario.delete(parseInt(documento));
            
            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró propietario con documento ${documento}`
                });
            }

            res.json({
                success: true,
                message: 'Propietario eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar propietario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Buscar propietarios por teléfono
     */
    async buscarPorTelefono(req, res) {
        try {
            const { telefono } = req.params;
            
            const propietarios = await propietario.buscarPorTelefono(telefono);
            
            res.json({
                success: true,
                data: propietarios,
                total: propietarios.length
            });

        } catch (error) {
            console.error('Error al buscar propietario por teléfono:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de un propietario
     */
    async obtenerEstadisticas(req, res) {
        try {
            const { documento } = req.params;
            
            // Verificar que el propietario existe
            const propietarioExiste = await propietario.findById(parseInt(documento));
            if (!propietarioExiste) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró propietario con documento ${documento}`
                });
            }

            const estadisticas = await propietario.obtenerEstadisticas(parseInt(documento));
            
            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new PropietarioController();