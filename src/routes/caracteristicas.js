const express = require('express');
const router = express.Router();
const { CaracteristicaController } = require('../controllers');

/**
 * Rutas para la gestión de características
 * Base: /api/caracteristicas
 */

// GET /api/caracteristicas/comunes - Obtener características más comunes
router.get('/comunes', CaracteristicaController.obtenerMasComunes);

// GET /api/caracteristicas/estadisticas - Obtener estadísticas de características
router.get('/estadisticas', CaracteristicaController.obtenerEstadisticas);

// GET /api/caracteristicas/buscar/:nombre - Buscar características por nombre
router.get('/buscar/:nombre', CaracteristicaController.buscarPorNombre);

// GET /api/caracteristicas/tipo/:tipoPropiedad - Obtener por tipo de propiedad
router.get('/tipo/:tipoPropiedad', CaracteristicaController.obtenerPorTipoPropiedad);

// GET /api/caracteristicas/propiedad/:propiedadId - Obtener características de una propiedad
router.get('/propiedad/:propiedadId', CaracteristicaController.obtenerPorPropiedad);

// POST /api/caracteristicas - Crear nueva característica
router.post('/', CaracteristicaController.crear);

// GET /api/caracteristicas/:id - Obtener característica por ID
router.get('/:id', CaracteristicaController.obtenerPorId);

// PUT /api/caracteristicas/:id - Actualizar característica
router.put('/:id', CaracteristicaController.actualizar);

// DELETE /api/caracteristicas/:id - Eliminar característica
router.delete('/:id', CaracteristicaController.eliminar);

// POST /api/caracteristicas/propiedad/:propiedadId/multiples - Crear múltiples características
router.post('/propiedad/:propiedadId/multiples', CaracteristicaController.crearMultiples);

// PUT /api/caracteristicas/propiedad/:propiedadId/multiples - Actualizar múltiples características
router.put('/propiedad/:propiedadId/multiples', CaracteristicaController.actualizarMultiples);

// DELETE /api/caracteristicas/propiedad/:propiedadId/todas - Eliminar todas las características de una propiedad
router.delete('/propiedad/:propiedadId/todas', CaracteristicaController.eliminarPorPropiedad);

module.exports = router;