const database = require('../config/database');

/**
 * Clase base para todos los modelos
 * Proporciona métodos comunes para operaciones CRUD
 */
class BaseModel {
    constructor(tableName, primaryKey = 'id') {
        this.tableName = tableName;
        this.primaryKey = primaryKey;
        this.db = database;
    }

    /**
     * Buscar todos los registros
     */
    async findAll(conditions = {}, orderBy = null, limit = null) {
        let sql = `SELECT * FROM ${this.tableName}`;
        const params = [];

        // Agregar condiciones WHERE
        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params.push(...Object.values(conditions));
        }

        // Agregar ORDER BY
        if (orderBy) {
            sql += ` ORDER BY ${orderBy}`;
        }

        // Agregar LIMIT
        if (limit) {
            sql += ` LIMIT ${limit}`;
        }

        return await this.db.query(sql, params);
    }

    /**
     * Buscar por ID
     */
    async findById(id) {
        const sql = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        const rows = await this.db.query(sql, [id]);
        return rows[0] || null;
    }

    /**
     * Buscar un registro por condiciones
     */
    async findOne(conditions) {
        const rows = await this.findAll(conditions, null, 1);
        return rows[0] || null;
    }

    /**
     * Crear un nuevo registro
     */
    async create(data) {
        const fields = Object.keys(data);
        const placeholders = fields.map(() => '?').join(', ');
        const values = Object.values(data);

        const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        const result = await this.db.query(sql, values);
        
        // Si tiene auto_increment, devolver el nuevo ID
        if (result.insertId) {
            return await this.findById(result.insertId);
        }
        
        // Si no tiene auto_increment, devolver el registro usando la clave primaria
        return await this.findById(data[this.primaryKey]);
    }

    /**
     * Actualizar un registro
     */
    async update(id, data) {
        const fields = Object.keys(data);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(data), id];

        const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this.primaryKey} = ?`;
        await this.db.query(sql, values);
        
        return await this.findById(id);
    }

    /**
     * Eliminar un registro
     */
    async delete(id) {
        const sql = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = ?`;
        const result = await this.db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Contar registros
     */
    async count(conditions = {}) {
        let sql = `SELECT COUNT(*) as total FROM ${this.tableName}`;
        const params = [];

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params.push(...Object.values(conditions));
        }

        const rows = await this.db.query(sql, params);
        return rows[0].total;
    }

    /**
     * Verificar si existe un registro
     */
    async exists(id) {
        const count = await this.count({ [this.primaryKey]: id });
        return count > 0;
    }
}

module.exports = BaseModel;