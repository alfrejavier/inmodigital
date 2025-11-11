const Cliente = require('../models/Cliente');
const cliente = new Cliente();

class ClienteController {
    /**
     * Obtener todos los clientes o buscar por término
     */
    async obtenerTodos(req, res) {
        try {
            const { search, buscar, page = 1, limit = 50 } = req.query;
            const searchTerm = search || buscar;

            let clientes;

            if (searchTerm && searchTerm.trim()) {
                // Búsqueda por término
                clientes = await cliente.buscarPorNombre(searchTerm.trim(), parseInt(limit));
            } else {
                // Obtener todos los clientes
                clientes = await cliente.obtenerTodos({ 
                    limite: parseInt(limit), 
                    pagina: parseInt(page) 
                });
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
    async obtenerPorId(req, res) {
        try {
            const { documento } = req.params;

            if (!documento) {
                return res.status(400).json({
                    success: false,
                    message: 'El documento es requerido'
                });
            }

            const clienteEncontrado = await cliente.obtenerPorId(documento);

            if (!clienteEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            res.json({
                success: true,
                data: clienteEncontrado
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
            const datosCliente = req.body;

            // Debug: Ver qué datos están llegando
            console.log('📝 Datos recibidos en crear cliente:', JSON.stringify(datosCliente, null, 2));

            // Validar que se envíen datos
            if (!datosCliente || Object.keys(datosCliente).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se enviaron datos del cliente'
                });
            }

            const nuevoCliente = await cliente.crear(datosCliente);

            res.status(201).json({
                success: true,
                message: 'Cliente creado exitosamente',
                data: nuevoCliente
            });

        } catch (error) {
            console.error('Error al crear cliente:', error);
            
            // Error de validación
            if (error.message.includes('Errores de validación') || 
                error.message.includes('Ya existe un cliente')) {
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
            const datosActualizacion = req.body;

            // Debug: Ver qué datos están llegando para actualizar
            console.log(`📝 Datos recibidos en actualizar cliente ${documento}:`, JSON.stringify(datosActualizacion, null, 2));

            if (!documento) {
                return res.status(400).json({
                    success: false,
                    message: 'El documento es requerido'
                });
            }

            if (!datosActualizacion || Object.keys(datosActualizacion).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se enviaron datos para actualizar'
                });
            }

            const clienteActualizado = await cliente.actualizar(documento, datosActualizacion);

            res.json({
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: clienteActualizado
            });

        } catch (error) {
            console.error('Error al actualizar cliente:', error);

            if (error.message.includes('Cliente no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('Errores de validación')) {
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

            if (!documento) {
                return res.status(400).json({
                    success: false,
                    message: 'El documento es requerido'
                });
            }

            // Verificar que el cliente existe
            const clienteExistente = await cliente.obtenerPorId(documento);
            if (!clienteExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            await cliente.eliminarPorId(documento);

            res.json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            
            // Error de restricción de clave foránea
            if (error.message.includes('foreign key constraint') || 
                error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({
                    success: false,
                    message: 'No se puede eliminar el cliente porque tiene registros asociados'
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
     * Buscar clientes por término específico
     */
    async buscar(req, res) {
        try {
            const { termino } = req.query;

            if (!termino || termino.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El término de búsqueda es requerido'
                });
            }

            const resultados = await cliente.buscarPorNombre(termino.trim());

            res.json({
                success: true,
                data: resultados,
                total: resultados.length,
                termino: termino.trim()
            });

        } catch (error) {
            console.error('Error al buscar clientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas generales de clientes
     */
    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await cliente.obtenerEstadisticas();

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
     * Obtener clientes por ciudad
     */
    async obtenerPorCiudad(req, res) {
        try {
            const { ciudad } = req.params;
            const { limit = 20 } = req.query;

            if (!ciudad) {
                return res.status(400).json({
                    success: false,
                    message: 'La ciudad es requerida'
                });
            }

            const clientesCiudad = await cliente.obtenerPorCiudad(ciudad, parseInt(limit));

            res.json({
                success: true,
                data: clientesCiudad,
                ciudad: ciudad,
                total: clientesCiudad.length
            });

        } catch (error) {
            console.error('Error al obtener clientes por ciudad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener lista de ciudades con clientes
     */
    async obtenerCiudades(req, res) {
        try {
            const ciudades = await cliente.obtenerCiudades();

            res.json({
                success: true,
                data: ciudades
            });

        } catch (error) {
            console.error('Error al obtener ciudades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new ClienteController();