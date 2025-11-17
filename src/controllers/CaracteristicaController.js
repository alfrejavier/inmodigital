const Caracteristica = require('../models/Caracteristica');

/**
 * Controlador para la gestión de características
 */
class CaracteristicaController {

    /**
     * Obtener todas las características de una propiedad
     */
    async obtenerPorPropiedad(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const caracteristicas = await Caracteristica.obtenerPorPropiedad(parseInt(propiedadId));
            
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
     * Obtener una característica por ID
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const caracteristicaEncontrada = await Caracteristica.findById(parseInt(id));
            
            if (!caracteristicaEncontrada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró característica con ID ${id}`
                });
            }

            res.json({
                success: true,
                data: caracteristicaEncontrada
            });

        } catch (error) {
            console.error('Error al obtener característica:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear una nueva característica
     */
    async crear(req, res) {
        try {
            const nuevaCaracteristica = await Caracteristica.crear(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Característica creada exitosamente',
                data: nuevaCaracteristica
            });

        } catch (error) {
            console.error('Error al crear característica:', error);
            
            if (error.message.includes('requerido') || 
                error.message.includes('No existe') ||
                error.message.includes('debe ser') ||
                error.message.includes('caracteres')) {
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
     * Crear múltiples características para una propiedad
     */
    async crearMultiples(req, res) {
        try {
            const { propiedadId } = req.params;
            const { caracteristicas } = req.body;
            
            if (!caracteristicas || !Array.isArray(caracteristicas)) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo características debe ser un array'
                });
            }

            const caracteristicasCreadas = await Caracteristica.crearMultiples(parseInt(propiedadId), caracteristicas);
            
            res.status(201).json({
                success: true,
                message: `Se crearon ${caracteristicasCreadas.length} características exitosamente`,
                data: caracteristicasCreadas
            });

        } catch (error) {
            console.error('Error al crear características múltiples:', error);
            
            if (error.message.includes('requerido') || 
                error.message.includes('No existe') ||
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
     * Actualizar una característica
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            
            const caracteristicaActualizada = await Caracteristica.actualizar(parseInt(id), req.body);
            
            res.json({
                success: true,
                message: 'Característica actualizada exitosamente',
                data: caracteristicaActualizada
            });

        } catch (error) {
            console.error('Error al actualizar característica:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('requerido') || 
                error.message.includes('debe ser') ||
                error.message.includes('caracteres')) {
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
     * Actualizar múltiples características de una propiedad
     */
    async actualizarMultiples(req, res) {
        try {
            const { propiedadId } = req.params;
            const { caracteristicas } = req.body;
            
            if (!caracteristicas || !Array.isArray(caracteristicas)) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo características debe ser un array'
                });
            }

            const caracteristicasActualizadas = await Caracteristica.actualizarMultiples(parseInt(propiedadId), caracteristicas);
            
            res.json({
                success: true,
                message: `Se actualizaron ${caracteristicasActualizadas.length} características exitosamente`,
                data: caracteristicasActualizadas
            });

        } catch (error) {
            console.error('Error al actualizar características múltiples:', error);
            
            if (error.message.includes('No existe')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('requerido') || 
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
     * Eliminar una característica
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            const eliminada = await Caracteristica.eliminar(parseInt(id));
            
            if (!eliminada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró característica con ID ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Característica eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar característica:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar todas las características de una propiedad
     */
    async eliminarPorPropiedad(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const cantidadEliminada = await Caracteristica.eliminarPorPropiedad(parseInt(propiedadId));
            
            res.json({
                success: true,
                message: `Se eliminaron ${cantidadEliminada} características de la propiedad`,
                cantidad_eliminada: cantidadEliminada
            });

        } catch (error) {
            console.error('Error al eliminar características de propiedad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Buscar características por nombre
     */
    async buscarPorNombre(req, res) {
        try {
            const { nombre } = req.params;
            
            const caracteristicasEncontradas = await Caracteristica.buscarPorNombre(nombre);
            
            res.json({
                success: true,
                data: caracteristicasEncontradas,
                total: caracteristicasEncontradas.length
            });

        } catch (error) {
            console.error('Error al buscar características:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener características más comunes
     */
    async obtenerMasComunes(req, res) {
        try {
            const { limite = 10 } = req.query;
            
            const caracteristicasComunes = await Caracteristica.obtenerMasComunes(parseInt(limite));
            
            res.json({
                success: true,
                data: caracteristicasComunes,
                total: caracteristicasComunes.length
            });

        } catch (error) {
            console.error('Error al obtener características comunes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener características por tipo de propiedad
     */
    async obtenerPorTipoPropiedad(req, res) {
        try {
            const { tipoPropiedad } = req.params;
            
            const caracteristicasPorTipo = await Caracteristica.obtenerPorTipoPropiedad(tipoPropiedad);
            
            res.json({
                success: true,
                data: caracteristicasPorTipo,
                total: caracteristicasPorTipo.length,
                tipo_propiedad: tipoPropiedad
            });

        } catch (error) {
            console.error('Error al obtener características por tipo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de características
     */
    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await Caracteristica.obtenerEstadisticas();
            
            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas de características:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new CaracteristicaController();
