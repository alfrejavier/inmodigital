const BaseModel = require('./BaseModel');
const database = require('../config/database');

/**
 * Modelo para gestión de propiedades inmobiliarias
 * Extiende BaseModel para heredar funcionalidades básicas
 */
class Propiedad extends BaseModel {
    constructor() {
        super('propiedades', 'id');
    }

    /**
     * Validar datos de una propiedad antes de crear/actualizar
     * @param {Object} datos - Datos de la propiedad
     * @param {boolean} esActualizacion - Si es una actualización (no requiere todos los campos)
     * @returns {Object} - {valido: boolean, errores: array}
     */
    static validarDatos(datos, esActualizacion = false) {
        const errores = [];
        const camposRequeridos = [
            'tipo_propiedad', 'depto', 'ciudad', 'ubicacion', 
            'tamano', 'precio', 'propietarios_documento'
        ];

        // Validar campos requeridos (solo para creación)
        if (!esActualizacion) {
            for (const campo of camposRequeridos) {
                if (!datos[campo] || datos[campo].toString().trim() === '') {
                    errores.push(`El campo ${campo} es requerido`);
                }
            }
        }

        // Validar tipo de propiedad
        if (datos.tipo_propiedad) {
            const tiposValidos = ['casa', 'apartamento', 'oficina', 'local', 'lote', 'finca', 'bodega'];
            if (!tiposValidos.includes(datos.tipo_propiedad)) {
                errores.push('Tipo de propiedad no válido');
            }
        }

        // Validar departamento y ciudad
        if (datos.depto && datos.depto.length > 50) {
            errores.push('El departamento no puede exceder 50 caracteres');
        }
        
        if (datos.ciudad && datos.ciudad.length > 100) {
            errores.push('La ciudad no puede exceder 100 caracteres');
        }

        // Validar ubicación
        if (datos.ubicacion && datos.ubicacion.length > 1000) {
            errores.push('La ubicación no puede exceder 1000 caracteres');
        }

        // Validar tamaño (debe ser número positivo)
        if (datos.tamano !== undefined) {
            const tamano = parseFloat(datos.tamano);
            if (isNaN(tamano) || tamano <= 0) {
                errores.push('El tamaño debe ser un número positivo');
            }
            if (tamano > 999999.99) {
                errores.push('El tamaño es demasiado grande');
            }
        }

        // Validar precio (debe ser número positivo)
        if (datos.precio !== undefined) {
            const precio = parseFloat(datos.precio);
            if (isNaN(precio) || precio <= 0) {
                errores.push('El precio debe ser un número positivo');
            }
            if (precio > 9999999999999.99) {
                errores.push('El precio es demasiado grande');
            }
        }

        // Validar disponibilidad
        if (datos.disponibilidad) {
            const disponibilidadValida = ['venta', 'arriendo', 'venta/arriendo'];
            if (!disponibilidadValida.includes(datos.disponibilidad)) {
                errores.push('Disponibilidad no válida');
            }
        }

        // Validar estado
        if (datos.estado) {
            const estadosValidos = ['excelente', 'bueno', 'regular', 'necesita_reparacion'];
            if (!estadosValidos.includes(datos.estado)) {
                errores.push('Estado no válido');
            }
        }

        // Validar documento propietario
        if (datos.propietarios_documento) {
            const documento = datos.propietarios_documento.toString().trim();
            if (documento.length < 5 || documento.length > 20) {
                errores.push('El documento del propietario debe tener entre 5 y 20 caracteres');
            }
        }

        return {
            valido: errores.length === 0,
            errores
        };
    }

    /**
     * Crear nueva propiedad con validaciones
     * @param {Object} datos - Datos de la propiedad
     * @returns {Object} - Resultado de la operación
     */
    static async crear(datos) {
        try {
            console.log('🏠 Creando nueva propiedad:', datos);

            // Validar datos
            const validacion = this.validarDatos(datos);
            if (!validacion.valido) {
                console.log('❌ Errores de validación:', validacion.errores);
                return {
                    exito: false,
                    mensaje: 'Datos de propiedad no válidos',
                    errores: validacion.errores
                };
            }

            // Verificar que el propietario existe
            const propietarioExiste = await this.verificarPropietarioExiste(datos.propietarios_documento);
            if (!propietarioExiste) {
                return {
                    exito: false,
                    mensaje: 'El propietario especificado no existe'
                };
            }

            // Preparar datos para inserción
            const datosLimpios = {
                tipo_propiedad: datos.tipo_propiedad.trim(),
                depto: datos.depto.trim(),
                ciudad: datos.ciudad.trim(),
                ubicacion: datos.ubicacion.trim(),
                tamano: parseFloat(datos.tamano),
                precio: parseFloat(datos.precio),
                caracteristicas: datos.caracteristicas ? datos.caracteristicas.trim() : null,
                disponibilidad: datos.disponibilidad || 'venta',
                estado: datos.estado || 'bueno',
                propietarios_documento: datos.propietarios_documento.toString().trim()
            };

            // Crear propiedad en la base de datos usando una instancia
            const instancia = new Propiedad();
            const propiedadCreada = await instancia.create(datosLimpios);
            
            if (propiedadCreada && propiedadCreada.id) {
                console.log('✅ Propiedad creada exitosamente con ID:', propiedadCreada.id);
                
                // Obtener la propiedad creada con información del propietario
                const propiedadCompleta = await this.obtenerPorIdConPropietario(propiedadCreada.id);
                
                return {
                    exito: true,
                    mensaje: 'Propiedad creada exitosamente',
                    id: propiedadCreada.id,
                    propiedad: propiedadCompleta
                };
            }

            return {
                exito: false,
                mensaje: 'Error al crear la propiedad en la base de datos'
            };

        } catch (error) {
            console.error('❌ Error creando propiedad:', error);
            return {
                exito: false,
                mensaje: 'Error interno del servidor al crear propiedad',
                error: error.message
            };
        }
    }

    /**
     * Actualizar propiedad existente
     * @param {number} id - ID de la propiedad
     * @param {Object} datos - Datos actualizados
     * @returns {Object} - Resultado de la operación
     */
    static async actualizar(id, datos) {
        try {
            console.log(`🏠 Actualizando propiedad ID ${id}:`, datos);

            // Validar que la propiedad existe
            const instancia = new Propiedad();
            const propiedadExiste = await instancia.findById(id);
            if (!propiedadExiste) {
                return {
                    exito: false,
                    mensaje: 'Propiedad no encontrada'
                };
            }

            // Validar datos (como actualización)
            const validacion = this.validarDatos(datos, true);
            if (!validacion.valido) {
                return {
                    exito: false,
                    mensaje: 'Datos de propiedad no válidos',
                    errores: validacion.errores
                };
            }

            // Si se está cambiando el propietario, verificar que existe
            if (datos.propietarios_documento) {
                const propietarioExiste = await this.verificarPropietarioExiste(datos.propietarios_documento);
                if (!propietarioExiste) {
                    return {
                        exito: false,
                        mensaje: 'El propietario especificado no existe'
                    };
                }
            }

            // Preparar datos limpios (solo campos que se están actualizando)
            const datosLimpios = {};
            
            if (datos.tipo_propiedad) datosLimpios.tipo_propiedad = datos.tipo_propiedad.trim();
            if (datos.depto) datosLimpios.depto = datos.depto.trim();
            if (datos.ciudad) datosLimpios.ciudad = datos.ciudad.trim();
            if (datos.ubicacion) datosLimpios.ubicacion = datos.ubicacion.trim();
            if (datos.tamano !== undefined) datosLimpios.tamano = parseFloat(datos.tamano);
            if (datos.precio !== undefined) datosLimpios.precio = parseFloat(datos.precio);
            if (datos.caracteristicas !== undefined) {
                datosLimpios.caracteristicas = datos.caracteristicas ? datos.caracteristicas.trim() : null;
            }
            if (datos.disponibilidad) datosLimpios.disponibilidad = datos.disponibilidad;
            if (datos.estado) datosLimpios.estado = datos.estado;
            if (datos.propietarios_documento) {
                datosLimpios.propietarios_documento = datos.propietarios_documento.toString().trim();
            }

            // Actualizar en la base de datos
            const propiedadActualizada = await instancia.update(id, datosLimpios);
            
            if (propiedadActualizada) {
                console.log('✅ Propiedad actualizada exitosamente');
                
                // Obtener la propiedad actualizada con información del propietario
                const propiedadCompleta = await this.obtenerPorIdConPropietario(id);
                
                return {
                    exito: true,
                    mensaje: 'Propiedad actualizada exitosamente',
                    propiedad: propiedadCompleta
                };
            }

            return {
                exito: false,
                mensaje: 'Error al actualizar la propiedad'
            };

        } catch (error) {
            console.error('❌ Error actualizando propiedad:', error);
            return {
                exito: false,
                mensaje: 'Error interno del servidor al actualizar propiedad',
                error: error.message
            };
        }
    }

    /**
     * Obtener propiedad por ID (sin información del propietario)
     * @param {number} id - ID de la propiedad
     * @returns {Object|null} - Datos de la propiedad
     */
    static async obtenerPorId(id) {
        try {
            const instancia = new Propiedad();
            return await instancia.findById(id);
        } catch (error) {
            console.error('❌ Error obteniendo propiedad por ID:', error);
            throw error;
        }
    }

    /**
     * Eliminar una propiedad por ID
     * @param {number} id - ID de la propiedad
     * @returns {boolean} - True si se eliminó, false si no
     */
    static async eliminar(id) {
        try {
            const instancia = new Propiedad();
            return await instancia.delete(id);
        } catch (error) {
            console.error('❌ Error eliminando propiedad:', error);
            throw error;
        }
    }

    /**
     * Obtener propiedad por ID con información del propietario
     * @param {number} id - ID de la propiedad
     * @returns {Object|null} - Datos de la propiedad con propietario
     */
    static async obtenerPorIdConPropietario(id) {
        try {
            const consulta = `
                SELECT 
                    p.*,
                    prop.nombre as propietario_nombre,
                    prop.cel as propietario_telefono,
                    prop.correo as propietario_correo
                FROM propiedades p
                LEFT JOIN propietarios prop ON p.propietarios_documento = prop.documento
                WHERE p.id = ?
            `;

            const resultado = await database.query(consulta, [id]);
            return resultado.length > 0 ? resultado[0] : null;

        } catch (error) {
            console.error('❌ Error obteniendo propiedad con propietario:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las propiedades con información del propietario
     * @param {Object} filtros - Filtros opcionales
     * @returns {Array} - Lista de propiedades
     */
    static async obtenerTodosConPropietario(filtros = {}) {
        try {
            let consulta = `
                SELECT 
                    p.*,
                    prop.nombre as propietario_nombre,
                    prop.cel as propietario_telefono,
                    prop.correo as propietario_correo
                FROM propiedades p
                LEFT JOIN propietarios prop ON p.propietarios_documento = prop.documento
                WHERE 1=1
            `;
            
            const parametros = [];

            // Aplicar filtros si existen
            if (filtros.tipo_propiedad) {
                consulta += ' AND p.tipo_propiedad = ?';
                parametros.push(filtros.tipo_propiedad);
            }

            if (filtros.ciudad) {
                consulta += ' AND p.ciudad LIKE ?';
                parametros.push(`%${filtros.ciudad}%`);
            }

            if (filtros.disponibilidad) {
                consulta += ' AND p.disponibilidad = ?';
                parametros.push(filtros.disponibilidad);
            }

            if (filtros.precio_min) {
                consulta += ' AND p.precio >= ?';
                parametros.push(parseFloat(filtros.precio_min));
            }

            if (filtros.precio_max) {
                consulta += ' AND p.precio <= ?';
                parametros.push(parseFloat(filtros.precio_max));
            }

            consulta += ' ORDER BY p.fecha_registro DESC';

            const resultados = await database.query(consulta, parametros);
            return resultados;

        } catch (error) {
            console.error('❌ Error obteniendo propiedades con propietarios:', error);
            throw error;
        }
    }

    /**
     * Verificar si un propietario existe en la base de datos
     * @param {string} documento - Documento del propietario
     * @returns {boolean} - True si existe, false si no
     */
    static async verificarPropietarioExiste(documento) {
        try {
            const consulta = 'SELECT COUNT(*) as count FROM propietarios WHERE documento = ?';
            const resultado = await database.query(consulta, [documento]);
            return resultado[0].count > 0;
        } catch (error) {
            console.error('❌ Error verificando propietario:', error);
            return false;
        }
    }

    /**
     * Obtener propiedades con filtros y paginación
     * @param {Object} opciones - Opciones de filtrado y paginación
     * @returns {Array} - Array de propiedades
     */
    static async obtenerConFiltros(opciones = {}) {
        try {
            const {
                filtros = {},
                precio_min = null,
                precio_max = null,
                ordenar_por = 'fecha_registro',
                orden = 'DESC',
                limite = 10,
                offset = 0
            } = opciones;

            let consulta = `
                SELECT 
                    p.*,
                    pr.nombre as propietario_nombre,
                    pr.cel as propietario_telefono,
                    pr.correo as propietario_email
                FROM propiedades p
                INNER JOIN propietarios pr ON p.propietarios_documento = pr.documento
                WHERE 1=1
            `;

            const parametros = [];

            // Aplicar filtros básicos
            Object.entries(filtros).forEach(([campo, valor]) => {
                consulta += ` AND p.${campo} = ?`;
                parametros.push(valor);
            });

            // Filtros de precio
            if (precio_min !== null) {
                consulta += ` AND p.precio >= ?`;
                parametros.push(precio_min);
            }

            if (precio_max !== null) {
                consulta += ` AND p.precio <= ?`;
                parametros.push(precio_max);
            }

            // Ordenamiento
            consulta += ` ORDER BY p.${ordenar_por} ${orden}`;

            // Paginación
            consulta += ` LIMIT ? OFFSET ?`;
            parametros.push(limite, offset);

            const resultado = await database.query(consulta, parametros);
            return resultado;

        } catch (error) {
            console.error('❌ Error obteniendo propiedades con filtros:', error);
            throw error;
        }
    }

    /**
     * Contar propiedades con filtros
     * @param {Object} opciones - Opciones de filtrado
     * @returns {number} - Cantidad de propiedades
     */
    static async contarConFiltros(opciones) {
        try {
            const {
                filtros = {},
                precio_min = null,
                precio_max = null
            } = opciones;

            let consulta = 'SELECT COUNT(*) as total FROM propiedades p WHERE 1=1';
            const parametros = [];

            // Aplicar filtros básicos
            Object.entries(filtros).forEach(([campo, valor]) => {
                consulta += ` AND p.${campo} = ?`;
                parametros.push(valor);
            });

            // Filtros de precio
            if (precio_min !== null) {
                consulta += ` AND p.precio >= ?`;
                parametros.push(precio_min);
            }

            if (precio_max !== null) {
                consulta += ` AND p.precio <= ?`;
                parametros.push(precio_max);
            }

            const resultado = await database.query(consulta, parametros);
            return resultado[0].total;

        } catch (error) {
            console.error('❌ Error contando propiedades con filtros:', error);
            throw error;
        }
    }

    /**
     * Obtener todas las propiedades de un propietario
     * @param {string} documento - Documento del propietario
     * @returns {Array} - Array de propiedades del propietario
     */
    static async obtenerPorPropietario(documento) {
        try {
            const consulta = `
                SELECT 
                    p.*,
                    pr.nombre as propietario_nombre,
                    pr.cel as propietario_telefono,
                    pr.correo as propietario_email
                FROM propiedades p
                INNER JOIN propietarios pr ON p.propietarios_documento = pr.documento
                WHERE p.propietarios_documento = ?
                ORDER BY p.fecha_registro DESC
            `;

            const resultado = await database.query(consulta, [documento]);
            return resultado;

        } catch (error) {
            console.error('❌ Error obteniendo propiedades por propietario:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de propiedades
     * @returns {Object} - Estadísticas básicas
     */
    static async obtenerEstadisticas() {
        try {
            const consultas = {
                total: 'SELECT COUNT(*) as total FROM propiedades',
                disponibles: "SELECT COUNT(*) as disponibles FROM propiedades WHERE disponibilidad = 'disponible'",
                vendidas: "SELECT COUNT(*) as vendidas FROM propiedades WHERE disponibilidad = 'vendida'",
                alquiladas: "SELECT COUNT(*) as alquiladas FROM propiedades WHERE disponibilidad = 'alquilada'",
                porTipo: `
                    SELECT tipo_propiedad, COUNT(*) as cantidad 
                    FROM propiedades 
                    GROUP BY tipo_propiedad 
                    ORDER BY cantidad DESC
                `,
                porCiudad: `
                    SELECT ciudad, COUNT(*) as cantidad 
                    FROM propiedades 
                    GROUP BY ciudad 
                    ORDER BY cantidad DESC 
                    LIMIT 10
                `
            };

            const estadisticas = {};

            // Ejecutar consultas básicas
            for (const [clave, consulta] of Object.entries(consultas)) {
                if (clave !== 'porTipo' && clave !== 'porCiudad') {
                    const resultado = await database.query(consulta);
                    estadisticas[clave] = resultado[0][clave] || resultado[0].total || 0;
                }
            }

            // Ejecutar consultas de agrupación
            estadisticas.porTipo = await database.query(consultas.porTipo);
            estadisticas.porCiudad = await database.query(consultas.porCiudad);

            return estadisticas;

        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            throw error;
        }
    }
}

module.exports = Propiedad;