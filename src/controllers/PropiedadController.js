const Propiedad = require('../models/Propiedad');

/**
 * Controlador para la gestión de propiedades
 */
class PropiedadController {

    /**
     * Obtener todas las propiedades con paginación y filtros
     */
    async obtenerTodas(req, res) {
        try {
            const {
                pagina = 1,
                limite = 10,
                tipo_propiedad,
                ciudad,
                depto,
                disponibilidad,
                precio_min,
                precio_max,
                ordenar_por = 'fecha_registro',
                orden = 'DESC'
            } = req.query;

            // Construir filtros
            const filtros = {};
            if (tipo_propiedad) filtros.tipo_propiedad = tipo_propiedad;
            if (ciudad) filtros.ciudad = ciudad;
            if (depto) filtros.depto = depto;
            if (disponibilidad) filtros.disponibilidad = disponibilidad;

            // Calcular offset para paginación
            const offset = (parseInt(pagina) - 1) * parseInt(limite);

            // Obtener propiedades con filtros y paginación
            const resultado = await Propiedad.obtenerConFiltros({
                filtros,
                precio_min: precio_min ? parseFloat(precio_min) : null,
                precio_max: precio_max ? parseFloat(precio_max) : null,
                ordenar_por,
                orden,
                limite: parseInt(limite),
                offset
            });

            // Contar total para paginación
            const total = await Propiedad.contarConFiltros({
                filtros,
                precio_min: precio_min ? parseFloat(precio_min) : null,
                precio_max: precio_max ? parseFloat(precio_max) : null
            });

            const totalPaginas = Math.ceil(total / parseInt(limite));

            res.json({
                success: true,
                data: {
                    propiedades: resultado,
                    paginacion: {
                        pagina_actual: parseInt(pagina),
                        total_paginas: totalPaginas,
                        total_registros: total,
                        registros_por_pagina: parseInt(limite)
                    }
                }
            });

        } catch (error) {
            console.error('Error obteniendo propiedades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener propiedades por propietario
     */
    async obtenerPorPropietario(req, res) {
        try {
            const { documento } = req.params;

            if (!documento) {
                return res.status(400).json({
                    success: false,
                    message: 'Documento del propietario requerido'
                });
            }

            // Verificar que el propietario existe
            const propietarioExiste = await Propiedad.verificarPropietarioExiste(documento);
            if (!propietarioExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Propietario no encontrado'
                });
            }

            const propiedades = await Propiedad.obtenerPorPropietario(documento);

            res.json({
                success: true,
                data: {
                    propietario_documento: documento,
                    total_propiedades: propiedades.length,
                    propiedades: propiedades
                }
            });

        } catch (error) {
            console.error('Error obteniendo propiedades por propietario:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener una propiedad por ID con información del propietario
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de propiedad inválido'
                });
            }

            const propiedad = await Propiedad.obtenerPorIdConPropietario(parseInt(id));

            if (!propiedad) {
                return res.status(404).json({
                    success: false,
                    message: 'Propiedad no encontrada'
                });
            }

            res.json({
                success: true,
                data: propiedad
            });

        } catch (error) {
            console.error('Error obteniendo propiedad:', error);
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
            const datosPropiedad = req.body;

            // Validar datos de entrada
            const erroresValidacion = Propiedad.validarDatos(datosPropiedad);
            if (erroresValidacion.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de propiedad inválidos',
                    errores: erroresValidacion
                });
            }

            // Verificar que el propietario existe
            const propietarioExiste = await Propiedad.verificarPropietarioExiste(datosPropiedad.propietarios_documento);
            if (!propietarioExiste) {
                return res.status(400).json({
                    success: false,
                    message: `No existe un propietario con documento: ${datosPropiedad.propietarios_documento}`
                });
            }

            // Crear la propiedad
            const resultado = await Propiedad.crear(datosPropiedad);

            // Verificar si hubo error en la creación
            if (!resultado.exito) {
                return res.status(400).json({
                    success: false,
                    message: resultado.mensaje,
                    errors: resultado.errores
                });
            }

            res.status(201).json({
                success: true,
                message: 'Propiedad creada exitosamente',
                data: resultado.propiedad
            });

        } catch (error) {
            console.error('Error creando propiedad:', error);
            
            // Manejo específico para errores de clave foránea
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({
                    success: false,
                    message: 'El propietario especificado no existe'
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
     * Actualizar una propiedad existente
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const datosActualizacion = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de propiedad inválido'
                });
            }

            // Verificar que la propiedad existe
            const propiedadExistente = await Propiedad.obtenerPorId(parseInt(id));
            if (!propiedadExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Propiedad no encontrada'
                });
            }

            // Validar datos de actualización (solo campos presentes)
            const erroresValidacion = Propiedad.validarDatos(datosActualizacion, false);
            if (erroresValidacion.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos de actualización inválidos',
                    errores: erroresValidacion
                });
            }

            // Si se está actualizando el propietario, verificar que existe
            if (datosActualizacion.propietarios_documento) {
                const propietarioExiste = await Propiedad.verificarPropietarioExiste(datosActualizacion.propietarios_documento);
                if (!propietarioExiste) {
                    return res.status(400).json({
                        success: false,
                        message: `No existe un propietario con documento: ${datosActualizacion.propietarios_documento}`
                    });
                }
            }

            // Actualizar la propiedad
            const propiedadActualizada = await Propiedad.actualizar(parseInt(id), datosActualizacion);

            // Obtener la propiedad completa con información del propietario
            const propiedadCompleta = await Propiedad.obtenerPorIdConPropietario(parseInt(id));

            res.json({
                success: true,
                message: 'Propiedad actualizada exitosamente',
                data: propiedadCompleta
            });

        } catch (error) {
            console.error('Error actualizando propiedad:', error);
            
            // Manejo específico para errores de clave foránea
            if (error.code === 'ER_NO_REFERENCED_ROW_2') {
                return res.status(400).json({
                    success: false,
                    message: 'El propietario especificado no existe'
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

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de propiedad inválido'
                });
            }

            // Verificar que la propiedad existe
            const propiedadExistente = await Propiedad.obtenerPorId(parseInt(id));
            if (!propiedadExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Propiedad no encontrada'
                });
            }

            // Eliminar la propiedad
            const eliminada = await Propiedad.eliminar(parseInt(id));

            if (eliminada) {
                res.json({
                    success: true,
                    message: 'Propiedad eliminada exitosamente'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'No se pudo eliminar la propiedad'
                });
            }

        } catch (error) {
            console.error('Error eliminando propiedad:', error);
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

            if (!id || isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de propiedad inválido'
                });
            }

            const disponibilidadesValidas = ['disponible', 'vendida', 'alquilada', 'reservada'];
            if (!disponibilidad || !disponibilidadesValidas.includes(disponibilidad)) {
                return res.status(400).json({
                    success: false,
                    message: 'Disponibilidad inválida. Valores permitidos: ' + disponibilidadesValidas.join(', ')
                });
            }

            // Verificar que la propiedad existe
            const propiedadExistente = await Propiedad.obtenerPorId(parseInt(id));
            if (!propiedadExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Propiedad no encontrada'
                });
            }

            // Actualizar disponibilidad
            await Propiedad.actualizar(parseInt(id), { disponibilidad });

            // Obtener la propiedad actualizada
            const propiedadActualizada = await Propiedad.obtenerPorIdConPropietario(parseInt(id));

            res.json({
                success: true,
                message: `Disponibilidad cambiada a: ${disponibilidad}`,
                data: propiedadActualizada
            });

        } catch (error) {
            console.error('Error cambiando disponibilidad:', error);
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
            const estadisticas = await Propiedad.obtenerEstadisticas();

            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }


}

module.exports = new PropiedadController();