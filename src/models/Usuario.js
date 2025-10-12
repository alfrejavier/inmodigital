const BaseModel = require('./BaseModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class Usuario extends BaseModel {
    constructor() {
        super('usuarios');
        this.fillable = [
            'documento',
            'nombre_usuario', 
            'password',
            'rol',
            'activo'
        ];
        this.hidden = ['password']; // No devolver password en las respuestas
    }

    // Validaciones específicas para usuarios
    validate(data, isUpdate = false) {
        const errors = [];

        // Validación del documento
        if (!isUpdate && (!data.documento || data.documento.toString().trim() === '')) {
            errors.push('El documento es requerido');
        }

        // Validación del nombre de usuario
        if (!isUpdate && (!data.nombre_usuario || data.nombre_usuario.toString().trim() === '')) {
            errors.push('El nombre de usuario es requerido');
        }

        if (data.nombre_usuario && data.nombre_usuario.length < 3) {
            errors.push('El nombre de usuario debe tener al menos 3 caracteres');
        }

        if (data.nombre_usuario && data.nombre_usuario.length > 50) {
            errors.push('El nombre de usuario no puede tener más de 50 caracteres');
        }

        // Validación de la contraseña (solo en creación o si se proporciona)
        if (!isUpdate && (!data.password || data.password.toString().trim() === '')) {
            errors.push('La contraseña es requerida');
        }

        if (data.password && data.password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        // Validación del rol
        const rolesValidos = ['admin', 'vendedor', 'propietario'];
        if (data.rol && !rolesValidos.includes(data.rol)) {
            errors.push('El rol debe ser: admin, vendedor o propietario');
        }

        return errors;
    }

    // Hash de la contraseña
    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    // Verificar contraseña
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Generar JWT token
    generateToken(usuario) {
        const payload = {
            id: usuario.id,
            documento: usuario.documento,
            nombre_usuario: usuario.nombre_usuario,
            rol: usuario.rol
        };

        return jwt.sign(payload, process.env.JWT_SECRET || 'mi_clave_secreta', {
            expiresIn: '24h'
        });
    }

    // Verificar JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'mi_clave_secreta');
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    // Crear usuario con password hasheada
    async crear(data) {
        // Validar datos
        const errors = this.validate(data);
        if (errors.length > 0) {
            throw new Error(`Datos inválidos: ${errors.join(', ')}`);
        }

        // Verificar si ya existe el documento
        const existeDocumento = await this.findById(data.documento);
        if (existeDocumento) {
            throw new Error('Ya existe un usuario con este documento');
        }

        // Verificar si ya existe el nombre de usuario
        const existeUsuario = await this.buscarPorNombreUsuario(data.nombre_usuario);
        if (existeUsuario) {
            throw new Error('Ya existe un usuario con este nombre de usuario');
        }

        // Hash de la contraseña
        const passwordHash = await this.hashPassword(data.password);

        // Preparar datos para inserción
        const userData = {
            documento: data.documento,
            nombre_usuario: data.nombre_usuario,
            password: passwordHash,
            rol: data.rol || 'vendedor',
            activo: data.activo !== undefined ? data.activo : true
        };

        const result = await this.create(userData);
        
        // Obtener el usuario creado sin la contraseña
        const usuarioCreado = await this.findById(data.documento);
        delete usuarioCreado.password;
        
        return usuarioCreado;
    }

    // Actualizar usuario
    async actualizar(documento, data) {
        // Validar datos de actualización
        const errors = this.validate(data, true);
        if (errors.length > 0) {
            throw new Error(`Datos inválidos: ${errors.join(', ')}`);
        }

        // Verificar que el usuario existe
        const usuarioExiste = await this.findById(documento);
        if (!usuarioExiste) {
            throw new Error('Usuario no encontrado');
        }

        // Si se proporciona nueva contraseña, hashearla
        if (data.password) {
            data.password = await this.hashPassword(data.password);
        }

        // Actualizar usuario
        await this.update(documento, data);
        
        // Retornar usuario actualizado sin contraseña
        const usuarioActualizado = await this.findById(documento);
        delete usuarioActualizado.password;
        
        return usuarioActualizado;
    }

    // Buscar usuario por nombre de usuario
    async buscarPorNombreUsuario(nombreUsuario) {
        const query = `
            SELECT * FROM ${this.tableName} 
            WHERE nombre_usuario = ? AND activo = 1
            LIMIT 1
        `;
        
        const result = await this.db.query(query, [nombreUsuario]);
        return result.length > 0 ? result[0] : null;
    }

    // Autenticar usuario (login)
    async autenticar(nombreUsuario, password) {
        // Buscar usuario por nombre de usuario
        const usuario = await this.buscarPorNombreUsuario(nombreUsuario);
        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        // Verificar contraseña
        const passwordValida = await this.verifyPassword(password, usuario.password);
        if (!passwordValida) {
            throw new Error('Credenciales inválidas');
        }

        // Actualizar último login
        await this.actualizarUltimoLogin(usuario.documento);

        // Generar token
        const token = this.generateToken(usuario);

        // Retornar datos del usuario sin contraseña
        delete usuario.password;
        
        return {
            usuario,
            token
        };
    }

    // Actualizar último login
    async actualizarUltimoLogin(documento) {
        const query = `
            UPDATE ${this.tableName} 
            SET ultimo_login = CURRENT_TIMESTAMP 
            WHERE documento = ?
        `;
        
        return await this.db.query(query, [documento]);
    }

    // Obtener usuarios activos por rol
    async obtenerPorRol(rol) {
        const query = `
            SELECT documento, nombre_usuario, rol, fecha_creacion, activo, ultimo_login
            FROM ${this.tableName} 
            WHERE rol = ? AND activo = 1
            ORDER BY nombre_usuario ASC
        `;
        
        return await this.db.query(query, [rol]);
    }

    // Cambiar estado activo/inactivo
    async cambiarEstado(documento, activo = true) {
        const query = `
            UPDATE ${this.tableName} 
            SET activo = ?, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE documento = ?
        `;
        
        const result = await this.db.query(query, [activo, documento]);
        
        if (result.affectedRows === 0) {
            throw new Error('Usuario no encontrado');
        }

        return await this.findById(documento);
    }

    // Obtener estadísticas de usuarios
    async obtenerEstadisticas() {
        const query = `
            SELECT 
                COUNT(*) as total_usuarios,
                COUNT(CASE WHEN activo = 1 THEN 1 END) as usuarios_activos,
                COUNT(CASE WHEN activo = 0 THEN 1 END) as usuarios_inactivos,
                COUNT(CASE WHEN rol = 'admin' THEN 1 END) as administradores,
                COUNT(CASE WHEN rol = 'vendedor' THEN 1 END) as vendedores,
                COUNT(CASE WHEN rol = 'propietario' THEN 1 END) as propietarios
            FROM ${this.tableName}
        `;
        
        const result = await this.db.query(query);
        return result[0];
    }

    // Override del método findById para excluir password
    async findById(id) {
        const query = `
            SELECT documento, nombre_usuario, rol, fecha_creacion, fecha_actualizacion, activo, ultimo_login
            FROM ${this.tableName} 
            WHERE documento = ? 
            LIMIT 1
        `;
        
        const result = await this.db.query(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    // Override del método findAll para excluir password
    async findAll(limit = null, offset = 0, filters = {}) {
        let query = `
            SELECT documento, nombre_usuario, rol, fecha_creacion, fecha_actualizacion, activo, ultimo_login
            FROM ${this.tableName}
        `;
        
        const params = [];
        const conditions = [];

        // Aplicar filtros
        if (filters.rol) {
            conditions.push('rol = ?');
            params.push(filters.rol);
        }

        if (filters.activo !== undefined) {
            conditions.push('activo = ?');
            params.push(filters.activo);
        }

        if (filters.search) {
            conditions.push('(nombre_usuario LIKE ? OR documento LIKE ?)');
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY nombre_usuario ASC';

        if (limit) {
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);
        }

        return await this.db.query(query, params);
    }
}

module.exports = Usuario;