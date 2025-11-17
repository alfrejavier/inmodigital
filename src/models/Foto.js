const BaseModel = require('./BaseModel');
const database = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Modelo para la tabla fotos
 */
class Foto extends BaseModel {
    constructor() {
        super('fotos', 'id');
    }

    /**
     * Crear una nueva foto (método estático)
     */
    static async crear(data) {
        const instancia = new Foto();
        
        // Validar datos requeridos
        instancia.validarDatosRequeridos(data);
        
        // Verificar que la propiedad exista
        await instancia.verificarPropiedad(data.propiedades_id);

        return await instancia.create(data);
    }

    /**
     * Obtener fotos de una propiedad (método estático)
     */
    static async obtenerPorPropiedad(propiedadId) {
        try {
            const consulta = `
                SELECT id, ruta, propiedades_id
                FROM fotos
                WHERE propiedades_id = ?
                ORDER BY id ASC
            `;
            
            const resultado = await database.query(consulta, [propiedadId]);
            return resultado;
        } catch (error) {
            console.error('❌ Error obteniendo fotos:', error);
            throw error;
        }
    }

    /**
     * Eliminar foto y su archivo físico (método estático)
     */
    static async eliminar(id) {
        try {
            const instancia = new Foto();
            const foto = await instancia.findById(id);
            
            if (!foto) {
                return false;
            }

            // Eliminar archivo físico
            try {
                const rutaCompleta = path.join(__dirname, '../../public', foto.ruta);
                await fs.unlink(rutaCompleta);
                console.log('✅ Archivo eliminado:', rutaCompleta);
            } catch (error) {
                console.warn('⚠️ No se pudo eliminar el archivo físico:', error.message);
            }

            // Eliminar registro de BD
            return await instancia.delete(id);
        } catch (error) {
            console.error('❌ Error eliminando foto:', error);
            throw error;
        }
    }

    /**
     * Eliminar todas las fotos de una propiedad (método estático)
     */
    static async eliminarPorPropiedad(propiedadId) {
        try {
            const fotos = await this.obtenerPorPropiedad(propiedadId);
            
            for (const foto of fotos) {
                try {
                    const rutaCompleta = path.join(__dirname, '../../public', foto.ruta);
                    await fs.unlink(rutaCompleta);
                } catch (error) {
                    console.warn('⚠️ No se pudo eliminar archivo:', foto.ruta);
                }
            }

            const consulta = 'DELETE FROM fotos WHERE propiedades_id = ?';
            const resultado = await database.query(consulta, [propiedadId]);
            return resultado.affectedRows || 0;
        } catch (error) {
            console.error('❌ Error eliminando fotos por propiedad:', error);
            throw error;
        }
    }

    /**
     * Contar fotos de una propiedad (método estático)
     */
    static async contar(propiedadId) {
        try {
            const consulta = 'SELECT COUNT(*) as total FROM fotos WHERE propiedades_id = ?';
            const resultado = await database.query(consulta, [propiedadId]);
            return resultado[0].total;
        } catch (error) {
            console.error('❌ Error contando fotos:', error);
            throw error;
        }
    }

    /**
     * Verificar que la propiedad exista
     */
    async verificarPropiedad(propiedadId) {
        const sql = `SELECT COUNT(*) as existe FROM propiedades WHERE id = ?`;
        const result = await database.query(sql, [propiedadId]);
        
        if (result[0].existe === 0) {
            throw new Error(`No existe una propiedad con ID ${propiedadId}`);
        }
        
        return true;
    }

    /**
     * Validar datos requeridos
     */
    validarDatosRequeridos(data) {
        const camposRequeridos = ['ruta', 'propiedades_id'];
        
        for (const campo of camposRequeridos) {
            if (!data[campo]) {
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Validar ruta
        if (data.ruta.trim().length === 0) {
            throw new Error('La ruta no puede estar vacía');
        }

        // Validar ID de propiedad
        if (!Number.isInteger(data.propiedades_id) || data.propiedades_id <= 0) {
            throw new Error('El ID de la propiedad debe ser un número entero positivo');
        }
    }
}

module.exports = Foto;