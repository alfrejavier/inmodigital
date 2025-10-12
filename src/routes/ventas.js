const express = require('express');
const router = express.Router();
const { VentaController } = require('../controllers');

/**
 * Rutas para la gestión de ventas
 * Base: /api/ventas
 */

// GET /api/ventas - Obtener todas las ventas
router.get('/', VentaController.obtenerTodas);

// GET /api/ventas/dashboard - Obtener dashboard de ventas
router.get('/dashboard', VentaController.obtenerDashboard);

// GET /api/ventas/estadisticas - Obtener estadísticas de ventas
router.get('/estadisticas', VentaController.obtenerEstadisticas);

// GET /api/ventas/reporte/mensual - Obtener reporte mensual
router.get('/reporte/mensual', VentaController.obtenerReporteMensual);

// GET /api/ventas/periodo - Obtener ventas por período
router.get('/periodo', VentaController.obtenerPorPeriodo);

// GET /api/ventas/estado/:estado - Obtener ventas por estado
router.get('/estado/:estado', VentaController.obtenerPorEstado);

// GET /api/ventas/:id - Obtener venta por ID
router.get('/:id', VentaController.obtenerPorId);

// POST /api/ventas - Crear nueva venta
router.post('/', VentaController.crear);

// PUT /api/ventas/:id - Actualizar venta
router.put('/:id', VentaController.actualizar);

// DELETE /api/ventas/:id - Eliminar venta
router.delete('/:id', VentaController.eliminar);

// PATCH /api/ventas/:id/estado - Cambiar estado de venta
router.patch('/:id/estado', VentaController.cambiarEstado);

module.exports = router;