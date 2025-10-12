const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla caracteristicas
 */
class Caracteristica extends BaseModel {
    constructor() {
        super('caracteristicas', 'idc');
    }

    /**
     * Crear una nueva característica
     */
    async crear(data) {
        // Validar datos requeridos
        this.validarDatosRequeridos(data);
        
        // Verificar que la propiedad exista
        await this.verificarPropiedad(data.propiedades_id);

        return await this.create(data);
    }

    /**
     * Crear múltiples características para una propiedad
     */
    async crearMultiples(propiedadId, caracteristicas) {
        // Verificar que la propiedad exista
        await this.verificarPropiedad(propiedadId);

        const caracteristicasCreadas = [];
        
        for (const caracteristica of caracteristicas) {
            const data = {
                ...caracteristica,
                propiedades_id: propiedadId
            };
            
            const caracteristicaCreada = await this.crear(data);
            caracteristicasCreadas.push(caracteristicaCreada);
        }

        return caracteristicasCreadas;
    }

    /**
     * Obtener características de una propiedad
     */
    async obtenerPorPropiedad(propiedadId) {
        return await this.findAll({ propiedades_id: propiedadId }, 'idc ASC');
    }

    /**
     * Actualizar característica
     */
    async actualizar(id, data) {
        const caracteristica = await this.findById(id);
        if (!caracteristica) {
            throw new Error(`No se encontró característica con ID ${id}`);
        }

        return await this.update(id, data);
    }

    /**
     * Eliminar todas las características de una propiedad
     */
    async eliminarPorPropiedad(propiedadId) {
        const sql = `DELETE FROM ${this.tableName} WHERE propiedades_id = ?`;
        const result = await this.db.query(sql, [propiedadId]);
        return result.affectedRows;
    }

    /**
     * Buscar características por nombre
     */
    async buscarPorNombre(nombre) {
        const sql = `
            SELECT c.*, p.tipo_propiedad, p.ubicacion
            FROM ${this.tableName} c
            INNER JOIN propiedades p ON c.propiedades_id = p.id
            WHERE c.nombre LIKE ?
            ORDER BY c.nombre, p.tipo_propiedad
        `;
        return await this.db.query(sql, [`%${nombre}%`]);
    }

    /**
     * Obtener características más comunes
     */
    async obtenerMasComunes(limite = 10) {
        const sql = `
            SELECT 
                nombre,
                COUNT(*) as frecuencia,
                AVG(cantidad) as cantidad_promedio
            FROM ${this.tableName}
            GROUP BY nombre
            ORDER BY frecuencia DESC, nombre ASC
            LIMIT ?
        `;
        return await this.db.query(sql, [limite]);
    }

    /**
     * Obtener características por tipo de propiedad
     */
    async obtenerPorTipoPropiedad(tipoPropiedad) {
        const sql = `
            SELECT c.*, p.tipo_propiedad
            FROM ${this.tableName} c
            INNER JOIN propiedades p ON c.propiedades_id = p.id
            WHERE p.tipo_propiedad = ?
            ORDER BY c.nombre, c.cantidad DESC
        `;
        return await this.db.query(sql, [tipoPropiedad]);
    }

    /**
     * Actualizar múltiples características de una propiedad
     */
    async actualizarMultiples(propiedadId, caracteristicas) {
        // Verificar que la propiedad exista
        await this.verificarPropiedad(propiedadId);

        // Eliminar características existentes
        await this.eliminarPorPropiedad(propiedadId);

        // Crear las nuevas características
        return await this.crearMultiples(propiedadId, caracteristicas);
    }

    /**
     * Contar características por propiedad
     */
    async contarPorPropiedad(propiedadId) {
        return await this.count({ propiedades_id: propiedadId });
    }

    /**
     * Verificar que la propiedad exista
     */
    async verificarPropiedad(propiedadId) {
        const sql = `SELECT COUNT(*) as existe FROM propiedades WHERE id = ?`;
        const result = await this.db.query(sql, [propiedadId]);
        
        if (result[0].existe === 0) {
            throw new Error(`No existe una propiedad con ID ${propiedadId}`);
        }
        
        return true;
    }

    /**
     * Validar datos requeridos
     */
    validarDatosRequeridos(data) {
        const camposRequeridos = ['nombre', 'propiedades_id'];
        
        for (const campo of camposRequeridos) {
            if (!data[campo]) {
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Validar nombre
        if (data.nombre.trim().length === 0) {
            throw new Error('El nombre de la característica no puede estar vacío');
        }

        // Validar ID de propiedad
        if (!Number.isInteger(data.propiedades_id) || data.propiedades_id <= 0) {
            throw new Error('El ID de la propiedad debe ser un número entero positivo');
        }

        // Validar cantidad si se proporciona
        if (data.cantidad !== undefined && data.cantidad !== null) {
            if (!Number.isInteger(data.cantidad) || data.cantidad < 0) {
                throw new Error('La cantidad debe ser un número entero positivo o cero');
            }
        }

        // Validar longitud del detalle si se proporciona
        if (data.detalle && data.detalle.length > 100) {
            throw new Error('El detalle no puede tener más de 100 caracteres');
        }
    }

    /**
     * Obtener estadísticas de características
     */
    async obtenerEstadisticas() {
        const sql = `
            SELECT 
                COUNT(*) as total_caracteristicas,
                COUNT(DISTINCT nombre) as tipos_diferentes,
                COUNT(DISTINCT propiedades_id) as propiedades_con_caracteristicas,
                AVG(cantidad) as cantidad_promedio,
                MAX(cantidad) as cantidad_maxima
            FROM ${this.tableName}
            WHERE cantidad IS NOT NULL
        `;
        const result = await this.db.query(sql);
        return result[0];
    }
}

module.exports = Caracteristica;