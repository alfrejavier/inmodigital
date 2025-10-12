const express = require('express');
const router = express.Router();
const { PropiedadController } = require('../controllers');

/**
 * Rutas para la gestión de propiedades
 * Base: /api/propiedades
 */

// GET /api/propiedades - Obtener todas las propiedades
router.get('/', PropiedadController.obtenerTodas);

// GET /api/propiedades/disponibles - Obtener propiedades disponibles
router.get('/disponibles', PropiedadController.obtenerDisponibles);

// GET /api/propiedades/estadisticas - Obtener estadísticas de propiedades
router.get('/estadisticas', PropiedadController.obtenerEstadisticas);

// POST /api/propiedades/buscar - Búsqueda avanzada de propiedades
router.post('/buscar', PropiedadController.buscarAvanzada);

// GET /api/propiedades/:id - Obtener propiedad por ID
router.get('/:id', PropiedadController.obtenerPorId);

// POST /api/propiedades - Crear nueva propiedad
router.post('/', PropiedadController.crear);

// PUT /api/propiedades/:id - Actualizar propiedad
router.put('/:id', PropiedadController.actualizar);

// DELETE /api/propiedades/:id - Eliminar propiedad
router.delete('/:id', PropiedadController.eliminar);

// PATCH /api/propiedades/:id/disponibilidad - Cambiar disponibilidad
router.patch('/:id/disponibilidad', PropiedadController.cambiarDisponibilidad);

// GET /api/propiedades/:id/fotos - Obtener fotos de la propiedad
router.get('/:id/fotos', PropiedadController.obtenerFotos);

// GET /api/propiedades/:id/caracteristicas - Obtener características de la propiedad
router.get('/:id/caracteristicas', PropiedadController.obtenerCaracteristicas);

module.exports = router;