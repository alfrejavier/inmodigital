const BaseModel = require('./BaseModel');
const database = require('../config/database');

/**
 * Modelo para gestión de características de propiedades
 * Permite almacenar detalles adicionales como habitaciones, baños, servicios, etc.
 */
class Caracteristica extends BaseModel {
    constructor() {
        super('caracteristicas', 'idc');
    }

    /**
     * Validar datos de una característica
     * @param {Object} datos - Datos de la característica
     * @param {boolean} esActualizacion - Si es actualización (no requiere todos los campos)
     * @returns {Array} - Array de errores (vacío si es válido)
     */
    static validarDatos(datos, esActualizacion = false) {
        const errores = [];
        const camposRequeridos = ['propiedades_id', 'nombre'];

        // Validar campos requeridos (solo para creación)
        if (!esActualizacion) {
            for (const campo of camposRequeridos) {
                if (!datos[campo] || datos[campo].toString().trim() === '') {
                    errores.push(`El campo ${campo} es requerido`);
                }
            }
        }

        // Validar propiedades_id
        if (datos.propiedades_id && (isNaN(datos.propiedades_id) || datos.propiedades_id <= 0)) {
            errores.push('El propiedades_id debe ser un número positivo');
        }

        // Validar nombre
        if (datos.nombre && datos.nombre.length > 100) {
            errores.push('El nombre no puede exceder 100 caracteres');
        }

        // Validar cantidad (si existe)
        if (datos.cantidad !== undefined && datos.cantidad !== null) {
            if (isNaN(datos.cantidad)) {
                errores.push('La cantidad debe ser un número');
            }
        }

        // Validar detalle
        if (datos.detalle && datos.detalle.length > 255) {
            errores.push('El detalle no puede exceder 255 caracteres');
        }

        return errores;
    }

    /**
     * Crear una nueva característica
     * @param {Object} datos - Datos de la característica
     * @returns {Object} - Característica creada
     */
    static async crear(datos) {
        try {
            const instancia = new Caracteristica();
            return await instancia.create(datos);
        } catch (error) {
            console.error('❌ Error creando característica:', error);
            throw error;
        }
    }

    /**
     * Actualizar una característica
     * @param {number} id - ID de la característica
     * @param {Object} datos - Datos a actualizar
     * @returns {Object} - Característica actualizada
     */
    static async actualizar(id, datos) {
        try {
            const instancia = new Caracteristica();
            return await instancia.update(id, datos);
        } catch (error) {
            console.error('❌ Error actualizando característica:', error);
            throw error;
        }
    }

    /**
     * Obtener característica por ID
     * @param {number} id - ID de la característica
     * @returns {Object|null} - Característica encontrada
     */
    static async obtenerPorId(id) {
        try {
            const instancia = new Caracteristica();
            return await instancia.findById(id);
        } catch (error) {
            console.error('❌ Error obteniendo característica:', error);
            throw error;
        }
    }

    /**
     * Eliminar una característica
     * @param {number} id - ID de la característica
     * @returns {boolean} - True si se eliminó
     */
    static async eliminar(id) {
        try {
            const instancia = new Caracteristica();
            return await instancia.delete(id);
        } catch (error) {
            console.error('❌ Error eliminando característica:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las características de una propiedad
     * @param {number} propiedadId - ID de la propiedad
     * @returns {Array} - Array de características
     */
    static async obtenerPorPropiedad(propiedadId) {
        try {
            const consulta = `
                SELECT 
                    idc,
                    propiedades_id,
                    nombre,
                    cantidad,
                    detalle
                FROM caracteristicas
                WHERE propiedades_id = ?
                ORDER BY idc
            `;

            const resultado = await database.query(consulta, [propiedadId]);
            return resultado;

        } catch (error) {
            console.error('❌ Error obteniendo características por propiedad:', error);
            throw error;
        }
    }

    /**
     * Obtener características con información de la propiedad
     * @param {number} propiedadId - ID de la propiedad (opcional)
     * @returns {Array} - Array de características con datos de propiedad
     */
    static async obtenerConPropiedad(propiedadId = null) {
        try {
            let consulta = `
                SELECT 
                    c.idc,
                    c.propiedades_id,
                    c.nombre,
                    c.cantidad,
                    c.detalle,
                    p.tipo_propiedad,
                    p.ciudad,
                    p.ubicacion
                FROM caracteristicas c
                INNER JOIN propiedades p ON c.propiedades_id = p.id
            `;

            const parametros = [];

            if (propiedadId) {
                consulta += ` WHERE c.propiedades_id = ?`;
                parametros.push(propiedadId);
            }

            consulta += ` ORDER BY c.propiedades_id, c.idc`;

            const resultado = await database.query(consulta, parametros);
            return resultado;

        } catch (error) {
            console.error('❌ Error obteniendo características con propiedad:', error);
            throw error;
        }
    }

    /**
     * Crear múltiples características para una propiedad
     * @param {number} propiedadId - ID de la propiedad
     * @param {Array} caracteristicas - Array de características a crear
     * @returns {Object} - Resultado de la operación
     */
    static async crearMultiples(propiedadId, caracteristicas) {
        try {
            if (!Array.isArray(caracteristicas) || caracteristicas.length === 0) {
                throw new Error('Se requiere un array de características');
            }

            const resultados = [];
            const errores = [];

            for (const caract of caracteristicas) {
                try {
                    const datos = {
                        propiedades_id: propiedadId,
                        nombre: caract.nombre,
                        cantidad: caract.cantidad || null,
                        detalle: caract.detalle || null
                    };

                    const creada = await this.crear(datos);
                    resultados.push(creada);
                } catch (error) {
                    errores.push({
                        caracteristica: caract,
                        error: error.message
                    });
                }
            }

            return {
                exitosas: resultados.length,
                fallidas: errores.length,
                resultados,
                errores
            };

        } catch (error) {
            console.error('❌ Error creando múltiples características:', error);
            throw error;
        }
    }

    /**
     * Eliminar todas las características de una propiedad
     * @param {number} propiedadId - ID de la propiedad
     * @returns {number} - Cantidad de características eliminadas
     */
    static async eliminarPorPropiedad(propiedadId) {
        try {
            const consulta = 'DELETE FROM caracteristicas WHERE propiedades_id = ?';
            const resultado = await database.query(consulta, [propiedadId]);
            return resultado.affectedRows || 0;

        } catch (error) {
            console.error('❌ Error eliminando características por propiedad:', error);
            throw error;
        }
    }

    /**
     * Verificar si una propiedad existe
     * @param {number} propiedadId - ID de la propiedad
     * @returns {boolean} - True si existe
     */
    static async verificarPropiedadExiste(propiedadId) {
        try {
            const consulta = 'SELECT COUNT(*) as count FROM propiedades WHERE id = ?';
            const resultado = await database.query(consulta, [propiedadId]);
            return resultado[0].count > 0;
        } catch (error) {
            console.error('❌ Error verificando propiedad:', error);
            return false;
        }
    }

    /**
     * Contar características por propiedad
     * @param {number} propiedadId - ID de la propiedad (opcional)
     * @returns {number|Array} - Cantidad total o array con conteos por propiedad
     */
    static async contar(propiedadId = null) {
        try {
            if (propiedadId) {
                const consulta = 'SELECT COUNT(*) as total FROM caracteristicas WHERE propiedades_id = ?';
                const resultado = await database.query(consulta, [propiedadId]);
                return resultado[0].total;
            } else {
                const consulta = `
                    SELECT 
                        p.id,
                        p.tipo_propiedad,
                        p.ciudad,
                        COUNT(c.idc) as total_caracteristicas
                    FROM propiedades p
                    LEFT JOIN caracteristicas c ON p.id = c.propiedades_id
                    GROUP BY p.id
                    ORDER BY total_caracteristicas DESC
                `;
                const resultado = await database.query(consulta);
                return resultado;
            }

        } catch (error) {
            console.error('❌ Error contando características:', error);
            throw error;
        }
    }
}

module.exports = Caracteristica;
