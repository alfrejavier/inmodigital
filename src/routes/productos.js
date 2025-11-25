const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/ProductoController');
const upload = require('../middleware/upload');

/**
 * Rutas para la gestión de productos
 * Base: /api/productos
 */

// GET /api/productos - Obtener todos los productos
router.get('/', ProductoController.obtenerTodos);

// GET /api/productos/stock-bajo - Obtener productos con stock bajo
router.get('/stock-bajo', ProductoController.obtenerStockBajo);

// GET /api/productos/marcas - Obtener marcas únicas
router.get('/marcas', ProductoController.obtenerMarcas);

// GET /api/productos/:id - Obtener producto por ID
router.get('/:id', ProductoController.obtenerPorId);

// POST /api/productos - Crear nuevo producto (con imagen)
router.post('/', upload.singleProducto, upload.handleMulterError, ProductoController.crear);

// PUT /api/productos/:id - Actualizar producto (con imagen)
router.put('/:id', upload.singleProducto, upload.handleMulterError, ProductoController.actualizar);

// PATCH /api/productos/:id/stock - Actualizar stock de un producto
router.patch('/:id/stock', ProductoController.actualizarStock);

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id', ProductoController.eliminar);

module.exports = router;
