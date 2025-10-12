const express = require('express');
const router = express.Router();
const { PropietarioController } = require('../controllers');
const { validarDocumento, validarPaginacion, validarCuerpoRequerido, sanitizarStrings, logAcceso } = require('../middleware/validation');

/**
 * Rutas para la gestión de propietarios
 * Base: /api/propietarios
 */

// Aplicar middleware de logging a todas las rutas
router.use(logAcceso('Propietarios'));

// GET /api/propietarios - Obtener todos los propietarios
router.get('/', validarPaginacion, PropietarioController.obtenerTodos);

// GET /api/propietarios/:documento - Obtener propietario por documento
router.get('/:documento', validarDocumento, PropietarioController.obtenerPorDocumento);

// POST /api/propietarios - Crear nuevo propietario
router.post('/', validarCuerpoRequerido, sanitizarStrings, PropietarioController.crear);

// PUT /api/propietarios/:documento - Actualizar propietario
router.put('/:documento', validarDocumento, validarCuerpoRequerido, sanitizarStrings, PropietarioController.actualizar);

// DELETE /api/propietarios/:documento - Eliminar propietario
router.delete('/:documento', validarDocumento, PropietarioController.eliminar);

// GET /api/propietarios/buscar/telefono/:telefono - Buscar por teléfono
router.get('/buscar/telefono/:telefono', PropietarioController.buscarPorTelefono);

// GET /api/propietarios/:documento/estadisticas - Obtener estadísticas del propietario
router.get('/:documento/estadisticas', validarDocumento, PropietarioController.obtenerEstadisticas);

module.exports = router;