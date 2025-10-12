const { propiedad, foto, caracteristica } = require('../models');

/**
 * Controlador para la gestión de propiedades
 */
class PropiedadController {

    /**
     * Obtener todas las propiedades
     */
    async obtenerTodas(req, res) {
        try {
            const { page = 1, limit = 10, ...filtros } = req.query;
            
            let propiedades;
            
            if (Object.keys(filtros).length > 0) {
                // Aplicar filtros de búsqueda
                filtros.limit = limit;
                propiedades = await propiedad.buscarPorFiltros(filtros);
            } else {
                const offset = (page - 1) * limit;
                propiedades = await propiedad.obtenerConPropietario();
            }

            res.json({
                success: true,
                data: propiedades,
                total: propiedades.length,
                page: parseInt(page),
                limit: parseInt(limit)
            });

        } catch (error) {
            console.error('Error al obtener propiedades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener propiedades disponibles
     */
    async obtenerDisponibles(req, res) {
        try {
            const { limit = 20, orden = 'precio ASC' } = req.query;
            
            const propiedadesDisponibles = await propiedad.obtenerDisponibles();
            
            res.json({
                success: true,
                data: propiedadesDisponibles,
                total: propiedadesDisponibles.length
            });

        } catch (error) {
            console.error('Error al obtener propiedades disponibles:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener una propiedad por ID
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const propiedadEncontrada = await propiedad.obtenerCompleta(parseInt(id));
            
            if (!propiedadEncontrada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró propiedad con ID ${id}`
                });
            }

            res.json({
                success: true,
                data: propiedadEncontrada
            });

        } catch (error) {
            console.error('Error al obtener propiedad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear una nueva propiedad
     */
    async crear(req, res) {
        try {
            const nuevaPropiedad = await propiedad.crear(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Propiedad creada exitosamente',
                data: nuevaPropiedad
            });

        } catch (error) {
            console.error('Error al crear propiedad:', error);
            
            // Manejar errores de validación
            if (error.message.includes('requerido') || 
                error.message.includes('No existe') ||
                error.message.includes('debe ser') ||
                error.message.includes('válida')) {
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
     * Actualizar una propiedad
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            
            const propiedadActualizada = await propiedad.actualizar(parseInt(id), req.body);
            
            res.json({
                success: true,
                message: 'Propiedad actualizada exitosamente',
                data: propiedadActualizada
            });

        } catch (error) {
            console.error('Error al actualizar propiedad:', error);
            
            if (error.message.includes('No se encontró') || error.message.includes('No existe')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('requerido') || 
                error.message.includes('debe ser') ||
                error.message.includes('válida')) {
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
     * Eliminar una propiedad
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            // Verificar que la propiedad no esté en una venta activa
            // Aquí podrías agregar validación adicional si es necesario
            
            const eliminada = await propiedad.delete(parseInt(id));
            
            if (!eliminada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró propiedad con ID ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Propiedad eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar propiedad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Cambiar disponibilidad de una propiedad
     */
    async cambiarDisponibilidad(req, res) {
        try {
            const { id } = req.params;
            const { disponibilidad } = req.body;
            
            if (!disponibilidad) {
                return res.status(400).json({
                    success: false,
                    message: 'La disponibilidad es requerida'
                });
            }

            const propiedadActualizada = await propiedad.cambiarDisponibilidad(parseInt(id), disponibilidad);
            
            res.json({
                success: true,
                message: 'Disponibilidad actualizada exitosamente',
                data: propiedadActualizada
            });

        } catch (error) {
            console.error('Error al cambiar disponibilidad:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('inválida')) {
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
     * Obtener fotos de una propiedad
     */
    async obtenerFotos(req, res) {
        try {
            const { id } = req.params;
            
            const fotos = await foto.obtenerPorPropiedad(parseInt(id));
            
            res.json({
                success: true,
                data: fotos,
                total: fotos.length
            });

        } catch (error) {
            console.error('Error al obtener fotos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener características de una propiedad
     */
    async obtenerCaracteristicas(req, res) {
        try {
            const { id } = req.params;
            
            const caracteristicas = await caracteristica.obtenerPorPropiedad(parseInt(id));
            
            res.json({
                success: true,
                data: caracteristicas,
                total: caracteristicas.length
            });

        } catch (error) {
            console.error('Error al obtener características:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de propiedades
     */
    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await propiedad.obtenerEstadisticas();
            
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

    /**
     * Buscar propiedades por filtros avanzados
     */
    async buscarAvanzada(req, res) {
        try {
            const filtros = req.body;
            
            const propiedadesEncontradas = await propiedad.buscarPorFiltros(filtros);
            
            res.json({
                success: true,
                data: propiedadesEncontradas,
                total: propiedadesEncontradas.length,
                filtros: filtros
            });

        } catch (error) {
            console.error('Error en búsqueda avanzada:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new PropiedadController();