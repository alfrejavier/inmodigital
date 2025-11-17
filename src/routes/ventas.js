const express = require('express');
const router = express.Router();
const VentaController = require('../controllers/VentaController');

/**
 * Rutas para la gestión de ventas
 * Base: /api/ventas
 */

// GET /api/ventas - Obtener todas las ventas
router.get('/', VentaController.obtenerTodas);

// GET /api/ventas/:id - Obtener venta por ID
router.get('/:id', VentaController.obtenerPorId);

// POST /api/ventas - Crear nueva venta
router.post('/', VentaController.crear);

// PUT /api/ventas/:id - Actualizar venta
router.put('/:id', VentaController.actualizar);

// DELETE /api/ventas/:id - Eliminar venta
router.delete('/:id', VentaController.eliminar);

module.exports = router;