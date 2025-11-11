const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

/**
 * @route GET /api/clientes
 * @desc Obtener todos los clientes o buscar por término
 * @params query: search, buscar, page, limit
 */
router.get('/', ClienteController.obtenerTodos);

/**
 * @route POST /api/clientes
 * @desc Crear un nuevo cliente
 * @access Privado (requiere token)
 * @body documento, nombre, direccion?, telefono?, ciudad?
 */
router.post('/', ClienteController.crear);

/**
 * @route GET /api/clientes/buscar
 * @desc Buscar clientes por término específico
 * @access Privado (requiere token)
 * @params query: termino
 */
router.get('/buscar', ClienteController.buscar);

/**
 * @route GET /api/clientes/estadisticas
 * @desc Obtener estadísticas generales de clientes
 * @access Privado (requiere token)
 */
router.get('/estadisticas', ClienteController.obtenerEstadisticas);

/**
 * @route GET /api/clientes/ciudades
 * @desc Obtener lista de ciudades con clientes
 * @access Privado (requiere token)
 */
router.get('/ciudades', ClienteController.obtenerCiudades);

/**
 * @route GET /api/clientes/ciudad/:ciudad
 * @desc Obtener clientes por ciudad específica
 * @access Privado (requiere token)
 * @params ciudad
 */
router.get('/ciudad/:ciudad', ClienteController.obtenerPorCiudad);

/**
 * @route GET /api/clientes/:documento
 * @desc Obtener un cliente específico por documento
 * @access Privado (requiere token)
 * @params documento
 */
router.get('/:documento', ClienteController.obtenerPorId);

/**
 * @route PUT /api/clientes/:documento
 * @desc Actualizar un cliente existente
 * @access Privado (requiere token)
 * @params documento
 * @body nombre?, direccion?, telefono?, ciudad?
 */
router.put('/:documento', ClienteController.actualizar);

/**
 * @route DELETE /api/clientes/:documento
 * @desc Eliminar un cliente
 * @access Privado (requiere token)
 * @params documento
 */
router.delete('/:documento', ClienteController.eliminar);

module.exports = router;