const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla fotos
 */
class Foto extends BaseModel {
    constructor() {
        super('fotos', 'id');
    }

    /**
     * Crear una nueva foto
     */
    async crear(data) {
        // Validar datos requeridos
        this.validarDatosRequeridos(data);
        
        // Verificar que la propiedad exista
        await this.verificarPropiedad(data.propiedades_id);

        return await this.create(data);
    }

    /**
     * Obtener fotos de una propiedad
     */
    async obtenerPorPropiedad(propiedadId) {
        return await this.findAll({ propiedades_id: propiedadId }, 'id ASC');
    }

    /**
     * Actualizar ruta de foto
     */
    async actualizarRuta(id, nuevaRuta) {
        const foto = await this.findById(id);
        if (!foto) {
            throw new Error(`No se encontró foto con ID ${id}`);
        }

        return await this.update(id, { ruta: nuevaRuta });
    }

    /**
     * Eliminar foto y su archivo
     */
    async eliminarFoto(id) {
        const foto = await this.findById(id);
        if (!foto) {
            throw new Error(`No se encontró foto con ID ${id}`);
        }

        // Eliminar registro de la base de datos
        const eliminada = await this.delete(id);
        
        if (eliminada) {
            // Aquí podrías agregar lógica para eliminar el archivo físico
            // const fs = require('fs').promises;
            // try {
            //     await fs.unlink(foto.ruta);
            // } catch (error) {
            //     console.log('Archivo ya no existe:', foto.ruta);
            // }
        }

        return eliminada;
    }

    /**
     * Eliminar todas las fotos de una propiedad
     */
    async eliminarPorPropiedad(propiedadId) {
        const fotos = await this.obtenerPorPropiedad(propiedadId);
        
        for (const foto of fotos) {
            await this.eliminarFoto(foto.id);
        }

        return fotos.length;
    }

    /**
     * Obtener la foto principal (primera) de una propiedad
     */
    async obtenerPrincipal(propiedadId) {
        const fotos = await this.obtenerPorPropiedad(propiedadId);
        return fotos.length > 0 ? fotos[0] : null;
    }

    /**
     * Contar fotos por propiedad
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

    /**
     * Obtener estadísticas de fotos
     */
    async obtenerEstadisticas() {
        const sql = `
            SELECT 
                COUNT(*) as total_fotos,
                COUNT(DISTINCT propiedades_id) as propiedades_con_fotos,
                AVG(fotos_por_propiedad.cantidad) as promedio_fotos_por_propiedad
            FROM ${this.tableName}
            LEFT JOIN (
                SELECT propiedades_id, COUNT(*) as cantidad
                FROM ${this.tableName}
                GROUP BY propiedades_id
            ) as fotos_por_propiedad ON ${this.tableName}.propiedades_id = fotos_por_propiedad.propiedades_id
        `;
        const result = await this.db.query(sql);
        return result[0];
    }
}

module.exports = Foto;