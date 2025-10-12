const express = require('express');
const router = express.Router();
const { FotoController } = require('../controllers');
const upload = require('../middleware/upload');

/**
 * Rutas para la gestión de fotos
 * Base: /api/fotos
 */

// GET /api/fotos/estadisticas - Obtener estadísticas de fotos
router.get('/estadisticas', FotoController.obtenerEstadisticas);

// GET /api/fotos/:id - Obtener foto por ID
router.get('/:id', FotoController.obtenerPorId);

// PUT /api/fotos/:id - Actualizar información de foto
router.put('/:id', FotoController.actualizar);

// DELETE /api/fotos/:id - Eliminar foto
router.delete('/:id', FotoController.eliminar);

// GET /api/fotos/propiedad/:propiedadId - Obtener fotos de una propiedad
router.get('/propiedad/:propiedadId', FotoController.obtenerPorPropiedad);

// GET /api/fotos/propiedad/:propiedadId/principal - Obtener foto principal
router.get('/propiedad/:propiedadId/principal', FotoController.obtenerPrincipal);

// POST /api/fotos/propiedad/:propiedadId - Subir foto a una propiedad
router.post('/propiedad/:propiedadId', 
    upload.single, 
    upload.handleMulterError, 
    FotoController.subir
);

// DELETE /api/fotos/propiedad/:propiedadId/todas - Eliminar todas las fotos de una propiedad
router.delete('/propiedad/:propiedadId/todas', FotoController.eliminarPorPropiedad);

module.exports = router;