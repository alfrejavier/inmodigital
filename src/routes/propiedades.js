const express = require('express');
const router = express.Router();
const PropiedadController = require('../controllers/PropiedadController');

/**
 * Rutas para la gestión de propiedades
 * Base: /api/propiedades
 */

// GET /api/propiedades - Obtener todas las propiedades
router.get('/', PropiedadController.obtenerTodas);

// GET /api/propiedades/propietario/:documento - Obtener propiedades por propietario
router.get('/propietario/:documento', PropiedadController.obtenerPorPropietario);

// GET /api/propiedades/estadisticas - Obtener estadísticas de propiedades
router.get('/estadisticas', PropiedadController.obtenerEstadisticas);



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



module.exports = router;