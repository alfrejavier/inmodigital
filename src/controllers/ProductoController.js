const Producto = require('../models/Producto');

/**
 * Controlador para la gestión de productos
 */
class ProductoController {

    /**
     * Obtener todos los productos
     */
    static async obtenerTodos(req, res) {
        try {
            const filtros = {
                marca: req.query.marca,
                estado: req.query.estado,
                search: req.query.search,
                stock_bajo: req.query.stock_bajo === 'true'
            };

            const productos = await Producto.obtenerTodos(filtros);
            const total = await Producto.contar();

            res.json({
                success: true,
                data: productos,
                total: total
            });

        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener un producto por ID
     */
    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const producto = await Producto.obtenerPorId(parseInt(id));
            
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontró producto con ID ' + id
                });
            }

            res.json({
                success: true,
                data: producto
            });

        } catch (error) {
            console.error('Error al obtener producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Crear un nuevo producto
     */
    static async crear(req, res) {
        try {
            // Si se subió una imagen, agregar la ruta al body
            if (req.file) {
                req.body.imagen_principal = '/uploads/productos/' + req.file.filename;
            }
            
            const nuevoProducto = await Producto.crear(req.body);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: nuevoProducto
            });

        } catch (error) {
            console.error('Error al crear producto:', error);
            
            if (error.message.includes('requerido') || 
                error.message.includes('debe ser') ||
                error.message.includes('no puede ser')) {
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
     * Actualizar un producto
     */
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            
            // Si se subió una imagen, agregar la ruta al body
            if (req.file) {
                req.body.imagen_principal = '/uploads/productos/' + req.file.filename;
            }
            
            await Producto.actualizar(parseInt(id), req.body);
            
            const producto = await Producto.obtenerPorId(parseInt(id));

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: producto
            });

        } catch (error) {
            console.error('Error al actualizar producto:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('requerido') || 
                error.message.includes('debe ser') ||
                error.message.includes('no puede ser')) {
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
     * Eliminar un producto
     */
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            await Producto.eliminar(parseInt(id));

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar producto:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
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
     * Actualizar stock de un producto
     */
    static async actualizarStock(req, res) {
        try {
            const { id } = req.params;
            const { operacion, cantidad } = req.body;
            
            await Producto.actualizarStock(parseInt(id), operacion, parseInt(cantidad));
            
            const producto = await Producto.obtenerPorId(parseInt(id));

            res.json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: producto
            });

        } catch (error) {
            console.error('Error al actualizar stock:', error);
            
            if (error.message.includes('No se encontró')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('debe ser')) {
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
     * Obtener productos con stock bajo
     */
    static async obtenerStockBajo(req, res) {
        try {
            const productos = await Producto.obtenerStockBajo();

            res.json({
                success: true,
                data: productos,
                total: productos.length
            });

        } catch (error) {
            console.error('Error al obtener productos con stock bajo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener marcas únicas
     */
    static async obtenerMarcas(req, res) {
        try {
            const marcas = await Producto.obtenerMarcas();

            res.json({
                success: true,
                data: marcas
            });

        } catch (error) {
            console.error('Error al obtener marcas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = ProductoController;
