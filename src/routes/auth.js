const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// Crear instancia del controlador
const usuarioController = new UsuarioController();

// Rutas públicas (sin autenticación)
router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', UsuarioController.autenticarToken, usuarioController.profile);
router.put('/profile', UsuarioController.autenticarToken, usuarioController.updateProfile);

// Rutas de administración (solo admins)
router.get('/usuarios', 
    UsuarioController.autenticarToken,
    UsuarioController.verificarRol('admin'),
    usuarioController.obtenerTodos
);

router.get('/usuarios/:documento', 
    UsuarioController.autenticarToken,
    usuarioController.obtenerPorDocumento
);

router.put('/usuarios/:documento/estado', 
    UsuarioController.autenticarToken,
    UsuarioController.verificarRol('admin'),
    usuarioController.cambiarEstado
);

router.get('/usuarios/rol/:rol', 
    UsuarioController.autenticarToken,
    usuarioController.obtenerPorRol
);

router.get('/estadisticas/usuarios', 
    UsuarioController.autenticarToken,
    UsuarioController.verificarRol('admin'),
    usuarioController.obtenerEstadisticas
);

module.exports = router;