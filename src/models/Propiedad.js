const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla propiedades
 */
class Propiedad extends BaseModel {
    constructor() {
        super('propiedades', 'id');
    }

    /**
     * Crear una nueva propiedad
     */
    async crear(data) {
        // Validar datos requeridos
        this.validarDatosRequeridos(data);
        
        // Verificar que el propietario exista
        const propietarioExiste = await this.verificarPropietario(data.propietarios_documento);
        if (!propietarioExiste) {
            throw new Error(`No existe un propietario con documento ${data.propietarios_documento}`);
        }

        return await this.create(data);
    }

    /**
     * Actualizar propiedad
     */
    async actualizar(id, data) {
        const propiedad = await this.findById(id);
        if (!propiedad) {
            throw new Error(`No se encontró propiedad con ID ${id}`);
        }

        // Si se está cambiando el propietario, verificar que exista
        if (data.propietarios_documento) {
            const propietarioExiste = await this.verificarPropietario(data.propietarios_documento);
            if (!propietarioExiste) {
                throw new Error(`No existe un propietario con documento ${data.propietarios_documento}`);
            }
        }

        return await this.update(id, data);
    }

    /**
     * Obtener propiedades disponibles para venta
     */
    async obtenerDisponibles() {
        return await this.findAll({ disponibilidad: 'disponible' }, 'precio ASC');
    }

    /**
     * Buscar propiedades por filtros
     */
    async buscarPorFiltros(filtros = {}) {
        let sql = `
            SELECT p.*, pr.nombre as propietario_nombre, pr.apellido1, pr.cel as propietario_cel
            FROM ${this.tableName} p
            INNER JOIN propietarios pr ON p.propietarios_documento = pr.documento
            WHERE 1=1
        `;
        const params = [];

        // Filtro por tipo de propiedad
        if (filtros.tipo_propiedad) {
            sql += ` AND p.tipo_propiedad = ?`;
            params.push(filtros.tipo_propiedad);
        }

        // Filtro por departamento
        if (filtros.depto) {
            sql += ` AND p.depto = ?`;
            params.push(filtros.depto);
        }

        // Filtro por ciudad
        if (filtros.ciudad) {
            sql += ` AND p.ciudad LIKE ?`;
            params.push(`%${filtros.ciudad}%`);
        }

        // Filtro por rango de precio
        if (filtros.precio_min) {
            sql += ` AND p.precio >= ?`;
            params.push(filtros.precio_min);
        }
        if (filtros.precio_max) {
            sql += ` AND p.precio <= ?`;
            params.push(filtros.precio_max);
        }

        // Filtro por disponibilidad
        if (filtros.disponibilidad) {
            sql += ` AND p.disponibilidad = ?`;
            params.push(filtros.disponibilidad);
        }

        // Filtro por ubicación
        if (filtros.ubicacion) {
            sql += ` AND p.ubicacion LIKE ?`;
            params.push(`%${filtros.ubicacion}%`);
        }

        // Ordenamiento
        const ordenamiento = filtros.orden || 'p.id DESC';
        sql += ` ORDER BY ${ordenamiento}`;

        // Límite
        if (filtros.limit) {
            sql += ` LIMIT ${parseInt(filtros.limit)}`;
        }

        return await this.db.query(sql, params);
    }

    /**
     * Obtener propiedades con información del propietario
     */
    async obtenerConPropietario(id = null) {
        let sql = `
            SELECT 
                p.*,
                pr.nombre as propietario_nombre,
                pr.apellido1 as propietario_apellido1,
                pr.apellido2 as propietario_apellido2,
                pr.cel as propietario_cel,
                pr.correo as propietario_correo
            FROM ${this.tableName} p
            INNER JOIN propietarios pr ON p.propietarios_documento = pr.documento
        `;
        const params = [];

        if (id) {
            sql += ` WHERE p.id = ?`;
            params.push(id);
        }

        sql += ` ORDER BY p.id DESC`;

        const result = await this.db.query(sql, params);
        return id ? (result[0] || null) : result;
    }

    /**
     * Obtener fotos de una propiedad
     */
    async obtenerFotos(id) {
        const sql = `SELECT * FROM fotos WHERE propiedades_id = ? ORDER BY id ASC`;
        return await this.db.query(sql, [id]);
    }

    /**
     * Obtener características de una propiedad
     */
    async obtenerCaracteristicas(id) {
        const sql = `SELECT * FROM caracteristicas WHERE propiedades_id = ? ORDER BY idc ASC`;
        return await this.db.query(sql, [id]);
    }

    /**
     * Obtener información completa de una propiedad
     */
    async obtenerCompleta(id) {
        const propiedad = await this.obtenerConPropietario(id);
        if (!propiedad) {
            return null;
        }

        // Obtener fotos y características
        propiedad.fotos = await this.obtenerFotos(id);
        propiedad.caracteristicas = await this.obtenerCaracteristicas(id);

        return propiedad;
    }

    /**
     * Cambiar disponibilidad de una propiedad
     */
    async cambiarDisponibilidad(id, nuevaDisponibilidad) {
        const disponibilidadesValidas = ['disponible', 'vendida', 'reservada', 'retirada'];
        if (!disponibilidadesValidas.includes(nuevaDisponibilidad)) {
            throw new Error(`Disponibilidad inválida. Debe ser una de: ${disponibilidadesValidas.join(', ')}`);
        }

        return await this.update(id, { disponibilidad: nuevaDisponibilidad });
    }

    /**
     * Obtener estadísticas de propiedades
     */
    async obtenerEstadisticas() {
        const sql = `
            SELECT 
                COUNT(*) as total_propiedades,
                COUNT(CASE WHEN disponibilidad = 'disponible' THEN 1 END) as disponibles,
                COUNT(CASE WHEN disponibilidad = 'vendida' THEN 1 END) as vendidas,
                COUNT(CASE WHEN disponibilidad = 'reservada' THEN 1 END) as reservadas,
                AVG(precio) as precio_promedio,
                MAX(precio) as precio_maximo,
                MIN(precio) as precio_minimo,
                tipo_propiedad,
                COUNT(*) as cantidad_por_tipo
            FROM ${this.tableName}
            GROUP BY tipo_propiedad
        `;
        return await this.db.query(sql);
    }

    /**
     * Verificar que el propietario existe
     */
    async verificarPropietario(documento) {
        const sql = `SELECT COUNT(*) as existe FROM propietarios WHERE documento = ?`;
        const result = await this.db.query(sql, [documento]);
        return result[0].existe > 0;
    }

    /**
     * Validar datos requeridos
     */
    validarDatosRequeridos(data) {
        const camposRequeridos = ['tipo_propiedad', 'depto', 'caracteristicas', 'disponibilidad', 'propietarios_documento'];
        
        for (const campo of camposRequeridos) {
            if (!data[campo]) {
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Validar tipo de propiedad
        if (data.tipo_propiedad.trim().length === 0) {
            throw new Error('El tipo de propiedad no puede estar vacío');
        }

        // Validar departamento
        if (data.depto.trim().length === 0) {
            throw new Error('El departamento no puede estar vacío');
        }

        // Validar características
        if (data.caracteristicas.trim().length === 0) {
            throw new Error('Las características no pueden estar vacías');
        }

        // Validar disponibilidad
        const disponibilidadesValidas = ['disponible', 'vendida', 'reservada', 'retirada'];
        if (!disponibilidadesValidas.includes(data.disponibilidad)) {
            throw new Error(`La disponibilidad debe ser una de: ${disponibilidadesValidas.join(', ')}`);
        }

        // Validar precio si se proporciona
        if (data.precio && (isNaN(data.precio) || data.precio < 0)) {
            throw new Error('El precio debe ser un número positivo');
        }

        // Validar propietario
        if (!Number.isInteger(data.propietarios_documento) || data.propietarios_documento <= 0) {
            throw new Error('El documento del propietario debe ser un número entero positivo');
        }
    }
}

module.exports = Propiedad;