const { cliente } = require('../models');

/**
 * Controlador para la gestión de clientes
 */
class ClienteController {

    /**
     * Obtener todos los clientes
     */
    async obtenerTodos(req, res) {
        try {
            const { page = 1, limit = 10, buscar } = req.query;
            
            let clientes;
            
            if (buscar) {
                clientes = await cliente.buscarPorNombre(buscar);
            } else {
                const offset = (page - 1) * limit;
                clientes = await cliente.findAll({}, 'nombre ASC', limit);
            }

            res.json({
                success: true,
                data: clientes,
                total: clientes.length,
                page: parseInt(page),
                limit: parseInt(limit)
            });

        } catch (error) {
            console.error('Error al obtener clientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener un cliente por documento
     */
    async obtenerPorDocumento(req, res) {
        try {
            const { documento } = req.params;
            
            const clienteEncontrado = await cliente.findById(parseInt(documento));
            
            if (!clienteEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con documento ${documento}`
                });
            }

            // Obtener historial de compras del cliente
            const compras = await cliente.obtenerCompras(parseInt(documento));
            
            res.json({
                success: true,
                data: {
                    ...clienteEncontrado,
                    compras
                }
            });

        } catch (error) {
            console.error('Error al obtener cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear un nuevo cliente
     */
    async crear(req, res) {
        try {
            const nuevoCliente = await cliente.crear(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Cliente creado exitosamente',
                data: nuevoCliente
            });

        } catch (error) {
            console.error('Error al crear cliente:', error);
            
            // Manejar errores de validación
            if (error.message.includes('requerido') || 
                error.message.includes('Ya existe') ||
                error.message.includes('debe ser') ||
                error.message.includes('formato')) {
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
     * Actualizar un cliente
     */
    async actualizar(req, res) {
        try {
            const { documento } = req.params;
            
            const clienteActualizado = await cliente.actualizar(parseInt(documento), req.body);
            
            res.json({
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: clienteActualizado
            });

        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('requerido') || 
                error.message.includes('debe ser') ||
                error.message.includes('formato')) {
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
     * Eliminar un cliente
     */
    async eliminar(req, res) {
        try {
            const { documento } = req.params;
            
            // Verificar que no tenga compras asociadas
            const compras = await cliente.obtenerCompras(parseInt(documento));
            
            if (compras.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el cliente porque tiene compras asociadas'
                });
            }

            const eliminado = await cliente.delete(parseInt(documento));
            
            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con documento ${documento}`
                });
            }

            res.json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Buscar cliente por celular
     */
    async buscarPorCelular(req, res) {
        try {
            const { celular } = req.params;
            
            const clienteEncontrado = await cliente.buscarPorCelular(celular);
            
            if (!clienteEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con celular ${celular}`
                });
            }

            res.json({
                success: true,
                data: clienteEncontrado
            });

        } catch (error) {
            console.error('Error al buscar cliente por celular:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener clientes interesados (con ventas pendientes)
     */
    async obtenerInteresados(req, res) {
        try {
            const clientesInteresados = await cliente.obtenerClientesInteresados();
            
            res.json({
                success: true,
                data: clientesInteresados,
                total: clientesInteresados.length
            });

        } catch (error) {
            console.error('Error al obtener clientes interesados:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de un cliente
     */
    async obtenerEstadisticas(req, res) {
        try {
            const { documento } = req.params;
            
            // Verificar que el cliente existe
            const clienteExiste = await cliente.findById(parseInt(documento));
            if (!clienteExiste) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con documento ${documento}`
                });
            }

            const estadisticas = await cliente.obtenerEstadisticas(parseInt(documento));
            
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
     * Obtener historial completo de un cliente
     */
    async obtenerHistorial(req, res) {
        try {
            const { documento } = req.params;
            
            // Verificar que el cliente existe
            const clienteExiste = await cliente.findById(parseInt(documento));
            if (!clienteExiste) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró cliente con documento ${documento}`
                });
            }

            const historial = await cliente.obtenerHistorial(parseInt(documento));
            
            res.json({
                success: true,
                data: historial,
                total: historial.length
            });

        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new ClienteController();