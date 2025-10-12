const { usuario } = require('../models');

class UsuarioController {
    
    // Registro de nuevo usuario
    async register(req, res) {
        try {
            const { documento, nombre_usuario, password, rol = 'vendedor' } = req.body;
            
            // Validación básica
            if (!documento || !nombre_usuario || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Documento, nombre de usuario y contraseña son requeridos',
                    errores: ['Faltan campos obligatorios']
                });
            }

            // Crear usuario
            const nuevoUsuario = await usuario.crear({
                documento,
                nombre_usuario,
                password,
                rol
            });

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                datos: nuevoUsuario
            });

        } catch (error) {
            console.error('Error en register:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al registrar usuario',
                errores: [error.message]
            });
        }
    }

    // Login de usuario
    async login(req, res) {
        try {
            const { nombre_usuario, password } = req.body;
            
            // Validación básica
            if (!nombre_usuario || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre de usuario y contraseña son requeridos',
                    errores: ['Faltan credenciales']
                });
            }

            // Autenticar usuario
            const resultado = await usuario.autenticar(nombre_usuario, password);

            res.json({
                success: true,
                message: 'Login exitoso',
                datos: {
                    usuario: resultado.usuario,
                    token: resultado.token
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Error de autenticación',
                errores: [error.message]
            });
        }
    }

    // Obtener perfil del usuario actual
    async profile(req, res) {
        try {
            const usuarioActual = await usuario.findById(req.user.documento);
            
            if (!usuarioActual) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    errores: ['Usuario no existe']
                });
            }

            res.json({
                success: true,
                message: 'Perfil obtenido exitosamente',
                datos: usuarioActual
            });

        } catch (error) {
            console.error('Error en profile:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil',
                errores: [error.message]
            });
        }
    }

    // Actualizar perfil del usuario
    async updateProfile(req, res) {
        try {
            const { nombre_usuario, password } = req.body;
            const datosActualizacion = {};

            // Solo incluir campos que se proporcionan
            if (nombre_usuario) datosActualizacion.nombre_usuario = nombre_usuario;
            if (password) datosActualizacion.password = password;

            if (Object.keys(datosActualizacion).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionaron datos para actualizar',
                    errores: ['Sin datos para actualizar']
                });
            }

            const usuarioActualizado = await usuario.actualizar(req.user.documento, datosActualizacion);

            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                datos: usuarioActualizado
            });

        } catch (error) {
            console.error('Error en updateProfile:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al actualizar perfil',
                errores: [error.message]
            });
        }
    }

    // Obtener todos los usuarios (solo admins)
    async obtenerTodos(req, res) {
        try {
            // Verificar que sea admin
            if (req.user.rol !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de administrador',
                    errores: ['Sin permisos de administrador']
                });
            }

            const { page = 1, limit = 10, rol, activo, search } = req.query;
            const offset = (page - 1) * limit;

            const filtros = {};
            if (rol) filtros.rol = rol;
            if (activo !== undefined) filtros.activo = activo === 'true';
            if (search) filtros.search = search;

            const usuarios = await usuario.findAll(parseInt(limit), offset, filtros);

            res.json({
                success: true,
                message: 'Usuarios obtenidos exitosamente',
                datos: usuarios,
                paginacion: {
                    pagina_actual: parseInt(page),
                    por_pagina: parseInt(limit),
                    total: usuarios.length
                }
            });

        } catch (error) {
            console.error('Error en obtenerTodos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                errores: [error.message]
            });
        }
    }

    // Obtener usuario específico por documento (solo admins)
    async obtenerPorDocumento(req, res) {
        try {
            // Verificar que sea admin o el mismo usuario
            if (req.user.rol !== 'admin' && req.user.documento !== req.params.documento) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado',
                    errores: ['Sin permisos para ver este usuario']
                });
            }

            const usuarioEncontrado = await usuario.findById(req.params.documento);
            
            if (!usuarioEncontrado) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    errores: ['Usuario no existe']
                });
            }

            res.json({
                success: true,
                message: 'Usuario encontrado',
                datos: usuarioEncontrado
            });

        } catch (error) {
            console.error('Error en obtenerPorDocumento:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                errores: [error.message]
            });
        }
    }

    // Cambiar estado de usuario (activar/desactivar) - Solo admins
    async cambiarEstado(req, res) {
        try {
            // Verificar que sea admin
            if (req.user.rol !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de administrador',
                    errores: ['Sin permisos de administrador']
                });
            }

            const { documento } = req.params;
            const { activo } = req.body;

            if (activo === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere especificar el estado (activo: true/false)',
                    errores: ['Falta campo activo']
                });
            }

            const usuarioActualizado = await usuario.cambiarEstado(documento, activo);

            res.json({
                success: true,
                message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
                datos: usuarioActualizado
            });

        } catch (error) {
            console.error('Error en cambiarEstado:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al cambiar estado del usuario',
                errores: [error.message]
            });
        }
    }

    // Obtener usuarios por rol
    async obtenerPorRol(req, res) {
        try {
            const { rol } = req.params;
            const usuariosPorRol = await usuario.obtenerPorRol(rol);

            res.json({
                success: true,
                message: `Usuarios con rol ${rol} obtenidos exitosamente`,
                datos: usuariosPorRol,
                total: usuariosPorRol.length
            });

        } catch (error) {
            console.error('Error en obtenerPorRol:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios por rol',
                errores: [error.message]
            });
        }
    }

    // Obtener estadísticas de usuarios (solo admins)
    async obtenerEstadisticas(req, res) {
        try {
            // Verificar que sea admin
            if (req.user.rol !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de administrador',
                    errores: ['Sin permisos de administrador']
                });
            }

            const estadisticas = await usuario.obtenerEstadisticas();

            res.json({
                success: true,
                message: 'Estadísticas de usuarios obtenidas exitosamente',
                datos: estadisticas
            });

        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas',
                errores: [error.message]
            });
        }
    }

    // Middleware de autenticación JWT
    static async autenticarToken(req, res, next) {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Token de acceso requerido',
                    errores: ['Sin token de autorización']
                });
            }

            // Verificar token
            const decoded = usuario.verifyToken(token);
            
            // Verificar que el usuario existe y está activo
            const usuarioActual = await usuario.findById(decoded.documento);
            if (!usuarioActual || !usuarioActual.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no válido o inactivo',
                    errores: ['Usuario no autorizado']
                });
            }

            // Agregar usuario al request
            req.user = decoded;
            next();

        } catch (error) {
            console.error('Error en autenticación:', error);
            res.status(403).json({
                success: false,
                message: 'Token inválido',
                errores: ['Token no válido o expirado']
            });
        }
    }

    // Middleware para verificar roles específicos
    static verificarRol(...rolesPermitidos) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado',
                    errores: ['Sin autenticación']
                });
            }

            if (!rolesPermitidos.includes(req.user.rol)) {
                return res.status(403).json({
                    success: false,
                    message: 'Permisos insuficientes',
                    errores: [`Se requiere rol: ${rolesPermitidos.join(' o ')}`]
                });
            }

            next();
        };
    }
}

module.exports = UsuarioController;