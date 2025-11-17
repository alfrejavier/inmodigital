const Venta = require('../models/Venta');

/**
 * Controlador para la gestión de ventas
 */
class VentaController {

    /**
     * Obtener todas las ventas
     */
    static async obtenerTodas(req, res) {
        try {
            const ventas = await Venta.obtenerConDetalles();
            const total = await Venta.contar();

            res.json({
                success: true,
                data: ventas,
                total: total
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
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const ventaEncontrada = await Venta.obtenerConDetalles(parseInt(id));
            
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
    static async crear(req, res) {
        try {
            const nuevaVenta = await Venta.crear(req.body);
            
            const ventaCreada = await Venta.obtenerConDetalles(nuevaVenta.idventas);

            res.status(201).json({
                success: true,
                message: 'Venta creada exitosamente',
                data: ventaCreada
            });

        } catch (error) {
            console.error('Error al crear venta:', error);
            
            if (error.message.includes('requerido') || 
                error.message.includes('No existe') ||
                error.message.includes('debe ser') ||
                error.message.includes('vendida') ||
                error.message.includes('inválid')) {
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
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            
            const ventaActualizada = await Venta.actualizar(parseInt(id), req.body);
            
            const venta = await Venta.obtenerConDetalles(parseInt(id));

            res.json({
                success: true,
                message: 'Venta actualizada exitosamente',
                data: venta
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
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            const eliminada = await Venta.eliminar(parseInt(id));
            
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
}

module.exports = VentaController;