const express = require('express');
const router = express.Router();
const { ClienteController } = require('../controllers');

/**
 * Rutas para la gestión de clientes
 * Base: /api/clientes
 */

// GET /api/clientes - Obtener todos los clientes
router.get('/', ClienteController.obtenerTodos);

// GET /api/clientes/interesados - Obtener clientes con ventas pendientes
router.get('/interesados', ClienteController.obtenerInteresados);

// GET /api/clientes/:documento - Obtener cliente por documento
router.get('/:documento', ClienteController.obtenerPorDocumento);

// POST /api/clientes - Crear nuevo cliente
router.post('/', ClienteController.crear);

// PUT /api/clientes/:documento - Actualizar cliente
router.put('/:documento', ClienteController.actualizar);

// DELETE /api/clientes/:documento - Eliminar cliente
router.delete('/:documento', ClienteController.eliminar);

// GET /api/clientes/buscar/celular/:celular - Buscar por celular
router.get('/buscar/celular/:celular', ClienteController.buscarPorCelular);

// GET /api/clientes/:documento/estadisticas - Obtener estadísticas del cliente
router.get('/:documento/estadisticas', ClienteController.obtenerEstadisticas);

// GET /api/clientes/:documento/historial - Obtener historial del cliente
router.get('/:documento/historial', ClienteController.obtenerHistorial);

module.exports = router;