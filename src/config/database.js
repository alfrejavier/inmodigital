const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'inmobiliaria',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };
        
        this.pool = null;
        this.init();
    }

    async init() {
        try {
            this.pool = mysql.createPool(this.config);
            console.log('✅ Pool de conexiones MySQL creado exitosamente');
            
            // Probar la conexión
            await this.testConnection();
        } catch (error) {
            console.error('❌ Error al crear el pool de conexiones:', error.message);
            throw error;
        }
    }

    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            console.log('✅ Conexión a la base de datos establecida correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error al conectar con la base de datos:', error.message);
            throw error;
        }
    }

    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('❌ Error en la consulta SQL:', error.message);
            console.error('SQL:', sql);
            console.error('Parámetros:', params);
            throw error;
        }
    }

    async beginTransaction() {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        return connection;
    }

    async commit(connection) {
        await connection.commit();
        connection.release();
    }

    async rollback(connection) {
        await connection.rollback();
        connection.release();
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('✅ Pool de conexiones cerrado');
        }
    }
}

// Singleton para mantener una sola instancia de la base de datos
const database = new Database();

module.exports = database;