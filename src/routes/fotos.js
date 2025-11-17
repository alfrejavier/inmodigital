const express = require('express');
const router = express.Router();
const FotoController = require('../controllers/FotoController');

/**
 * Rutas para la gestión de fotos
 * Base: /api/fotos
 */

// GET /api/fotos/propiedad/:propiedadId - Obtener fotos de una propiedad
router.get('/propiedad/:propiedadId', FotoController.obtenerPorPropiedad);

// POST /api/fotos/propiedad/:propiedadId - Subir fotos a una propiedad (múltiples)
router.post('/propiedad/:propiedadId', 
    FotoController.uploadMiddleware,
    FotoController.subir
);

// DELETE /api/fotos/:id - Eliminar una foto
router.delete('/:id', FotoController.eliminar);

// DELETE /api/fotos/propiedad/:propiedadId/todas - Eliminar todas las fotos de una propiedad
router.delete('/propiedad/:propiedadId/todas', FotoController.eliminarPorPropiedad);

module.exports = router;