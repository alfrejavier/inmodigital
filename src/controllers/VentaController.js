const { venta } = require('../models');

/**
 * Controlador para la gestión de ventas
 */
class VentaController {

    /**
     * Obtener todas las ventas
     */
    async obtenerTodas(req, res) {
        try {
            const { page = 1, limit = 10, estado, fecha_inicio, fecha_fin } = req.query;
            
            let ventas;
            
            if (fecha_inicio && fecha_fin) {
                ventas = await venta.obtenerPorPeriodo(fecha_inicio, fecha_fin);
            } else if (estado) {
                ventas = await venta.obtenerPorEstado(estado);
            } else {
                ventas = await venta.obtenerConDetalles();
            }

            // Aplicar paginación
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const ventasPaginadas = ventas.slice(startIndex, endIndex);

            res.json({
                success: true,
                data: ventasPaginadas,
                total: ventas.length,
                page: parseInt(page),
                limit: parseInt(limit)
            });

        } catch (error) {
            console.error('Error al obtener ventas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener una venta por ID
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const ventaEncontrada = await venta.obtenerConDetalles(parseInt(id));
            
            if (!ventaEncontrada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró venta con ID ${id}`
                });
            }

            res.json({
                success: true,
                data: ventaEncontrada
            });

        } catch (error) {
            console.error('Error al obtener venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear una nueva venta
     */
    async crear(req, res) {
        try {
            const nuevaVenta = await venta.crear(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Venta creada exitosamente',
                data: nuevaVenta
            });

        } catch (error) {
            console.error('Error al crear venta:', error);
            
            // Manejar errores de validación
            if (error.message.includes('requerido') || 
                error.message.includes('No existe') ||
                error.message.includes('debe ser') ||
                error.message.includes('válida') ||
                error.message.includes('vendida')) {
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
     * Actualizar una venta
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            
            const ventaActualizada = await venta.actualizar(parseInt(id), req.body);
            
            res.json({
                success: true,
                message: 'Venta actualizada exitosamente',
                data: ventaActualizada
            });

        } catch (error) {
            console.error('Error al actualizar venta:', error);
            
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
     * Eliminar una venta
     */
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            const eliminada = await venta.delete(parseInt(id));
            
            if (!eliminada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró venta con ID ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Venta eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar venta:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Cambiar estado de una venta
     */
    async cambiarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            
            if (!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'El estado es requerido'
                });
            }

            const ventaActualizada = await venta.cambiarEstado(parseInt(id), estado);
            
            res.json({
                success: true,
                message: 'Estado de venta actualizado exitosamente',
                data: ventaActualizada
            });

        } catch (error) {
            console.error('Error al cambiar estado:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('inválido')) {
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
     * Obtener ventas por estado
     */
    async obtenerPorEstado(req, res) {
        try {
            const { estado } = req.params;
            
            const ventasPorEstado = await venta.obtenerPorEstado(estado);
            
            res.json({
                success: true,
                data: ventasPorEstado,
                total: ventasPorEstado.length,
                estado: estado
            });

        } catch (error) {
            console.error('Error al obtener ventas por estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener ventas por período
     */
    async obtenerPorPeriodo(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            
            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Las fechas de inicio y fin son requeridas'
                });
            }

            const ventasPorPeriodo = await venta.obtenerPorPeriodo(fecha_inicio, fecha_fin);
            
            res.json({
                success: true,
                data: ventasPorPeriodo,
                total: ventasPorPeriodo.length,
                periodo: {
                    inicio: fecha_inicio,
                    fin: fecha_fin
                }
            });

        } catch (error) {
            console.error('Error al obtener ventas por período:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de ventas
     */
    async obtenerEstadisticas(req, res) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            
            const estadisticas = await venta.obtenerEstadisticas(fecha_inicio, fecha_fin);
            
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
     * Obtener reporte de ventas por mes
     */
    async obtenerReporteMensual(req, res) {
        try {
            const { año = new Date().getFullYear() } = req.query;
            
            const reporteMensual = await venta.obtenerVentasPorMes(parseInt(año));
            
            res.json({
                success: true,
                data: reporteMensual,
                año: parseInt(año)
            });

        } catch (error) {
            console.error('Error al obtener reporte mensual:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener dashboard de ventas
     */
    async obtenerDashboard(req, res) {
        try {
            const añoActual = new Date().getFullYear();
            const mesActual = new Date().getMonth() + 1;
            const fechaInicieMes = `${añoActual}-${mesActual.toString().padStart(2, '0')}-01`;
            const fechaFinMes = new Date(añoActual, mesActual, 0).toISOString().split('T')[0];

            // Obtener estadísticas generales
            const estadisticasGenerales = await venta.obtenerEstadisticas();
            
            // Obtener estadísticas del mes actual
            const estadisticasMes = await venta.obtenerEstadisticas(fechaInicieMes, fechaFinMes);
            
            // Obtener reporte del año actual
            const reporteAnual = await venta.obtenerVentasPorMes(añoActual);
            
            // Obtener ventas pendientes
            const ventasPendientes = await venta.obtenerPorEstado('pendiente');

            res.json({
                success: true,
                data: {
                    estadisticas_generales: estadisticasGenerales,
                    estadisticas_mes_actual: estadisticasMes,
                    reporte_anual: reporteAnual,
                    ventas_pendientes: {
                        cantidad: ventasPendientes.length,
                        ventas: ventasPendientes.slice(0, 5) // Solo las primeras 5
                    }
                }
            });

        } catch (error) {
            console.error('Error al obtener dashboard:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new VentaController();