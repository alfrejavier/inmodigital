const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla clientes
 * Estructura real: documento, nombre, apellido, cel, correo
 */
class Cliente extends BaseModel {
    constructor() {
        super('clientes', 'documento'); // tabla y clave primaria
        this.camposRequeridos = ['documento', 'nombre'];
        this.camposOpcionales = ['apellido', 'cel', 'correo'];
        this.camposAutomaticos = ['fecha_registro']; // Campos manejados automáticamente
    }

    /**
     * Obtener todos los clientes con paginación
     */
    async obtenerTodos(options = {}) {
        const { limite = 50, pagina = 1 } = options;
        const offset = (pagina - 1) * limite;
        
        return await this.findAll({}, 'nombre ASC, apellido ASC', limite);
    }

    /**
     * Obtener cliente por ID (documento)
     */
    async obtenerPorId(documento) {
        return await this.findById(documento);
    }

    /**
     * Insertar nuevo cliente
     */
    async insertar(datos) {
        return await this.create(datos);
    }

    /**
     * Actualizar cliente por ID
     */
    async actualizarPorId(documento, datos) {
        return await this.update(documento, datos);
    }

    /**
     * Eliminar cliente por ID
     */
    async eliminarPorId(documento) {
        return await this.delete(documento);
    }

    /**
     * Validar datos del cliente
     */
    validarDatos(datos) {
        const errores = [];

        // Validar documento
        if (!datos.documento) {
            errores.push('El documento es obligatorio');
        } else {
            const docString = datos.documento.toString();
            if (!/^\d+$/.test(docString)) {
                errores.push('El documento debe contener solo números');
            } else if (parseInt(docString) <= 0) {
                errores.push('El documento debe ser un número positivo');
            }
        }

        // Validar nombre
        if (!datos.nombre) {
            errores.push('El nombre es obligatorio');
        } else if (datos.nombre.length < 2) {
            errores.push('El nombre debe tener al menos 2 caracteres');
        } else if (datos.nombre.length > 45) {
            errores.push('El nombre no puede exceder 45 caracteres');
        }

        // Validar apellido (opcional)
        if (datos.apellido && datos.apellido.length > 45) {
            errores.push('El apellido no puede exceder 45 caracteres');
        }

        // Validar celular (opcional)
        if (datos.cel && datos.cel.length > 45) {
            errores.push('El celular no puede exceder 45 caracteres');
        }

        // Validar correo (opcional)
        if (datos.correo) {
            if (datos.correo.length > 45) {
                errores.push('El correo no puede exceder 45 caracteres');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(datos.correo)) {
                errores.push('El formato del correo electrónico no es válido');
            }
        }

        return errores;
    }

    /**
     * Crear un nuevo cliente
     */
    async crear(datos) {
        try {
            // Validar datos
            const erroresValidacion = this.validarDatos(datos);
            if (erroresValidacion.length > 0) {
                throw new Error(`Errores de validación: ${erroresValidacion.join(', ')}`);
            }

            // Verificar si ya existe un cliente con ese documento
            const clienteExistente = await this.obtenerPorId(datos.documento);
            if (clienteExistente) {
                throw new Error('Ya existe un cliente con ese documento');
            }

            // Preparar datos para inserción
            const datosCliente = {
                documento: parseInt(datos.documento),
                nombre: datos.nombre.trim(),
                apellido: datos.apellido ? datos.apellido.trim() : null,
                cel: datos.cel ? datos.cel.trim() : null,
                correo: datos.correo ? datos.correo.trim() : null,
                fecha_registro: new Date()
            };

            const resultado = await this.insertar(datosCliente);
            return await this.obtenerPorId(datos.documento);

        } catch (error) {
            console.error('Error al crear cliente:', error);
            throw error;
        }
    }

    /**
     * Actualizar un cliente existente
     */
    async actualizar(documento, datos) {
        try {
            // Verificar que el cliente existe
            const clienteExistente = await this.obtenerPorId(documento);
            if (!clienteExistente) {
                throw new Error('Cliente no encontrado');
            }

            // Validar nuevos datos
            const datosActualizacion = { ...datos, documento };
            const erroresValidacion = this.validarDatos(datosActualizacion);
            if (erroresValidacion.length > 0) {
                throw new Error(`Errores de validación: ${erroresValidacion.join(', ')}`);
            }

            // Preparar datos para actualización (excluir fecha_registro)
            const datosCliente = {
                nombre: datos.nombre.trim(),
                apellido: datos.apellido ? datos.apellido.trim() : null,
                cel: datos.cel ? datos.cel.trim() : null,
                correo: datos.correo ? datos.correo.trim() : null
            };

            // Asegurarse de que fecha_registro no se pueda actualizar
            delete datosCliente.fecha_registro;

            await this.actualizarPorId(documento, datosCliente);
            return await this.obtenerPorId(documento);

        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            throw error;
        }
    }

    /**
     * Buscar clientes por nombre, documento, ciudad o teléfono
     */
    async buscarPorNombre(termino, limite = 50) {
        try {
            if (!termino || termino.trim() === '') {
                return await this.obtenerTodos({ limite });
            }

            const terminoBusqueda = `%${termino.trim()}%`;
            
            const query = `
                SELECT * FROM ${this.tableName} 
                WHERE nombre LIKE ? 
                   OR apellido LIKE ?
                   OR documento LIKE ? 
                   OR cel LIKE ? 
                   OR correo LIKE ?
                ORDER BY 
                    CASE 
                        WHEN nombre LIKE ? THEN 1
                        WHEN apellido LIKE ? THEN 2
                        WHEN documento LIKE ? THEN 3
                        WHEN cel LIKE ? THEN 4
                        ELSE 5
                    END,
                    nombre ASC, apellido                    # Conéctate a MySQL y ejecuta:
                    source sql/crear_tabla_productos.sql                    # Conéctate a MySQL y ejecuta:
                    source sql/crear_tabla_productos.sql ASC
                LIMIT ?
            `;

            const parametros = [
                terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda, terminoBusqueda,
                `${termino.trim()}%`, `${termino.trim()}%`, `${termino.trim()}%`, `${termino.trim()}%`,
                limite
            ];

            return await this.db.query(query, parametros);

        } catch (error) {
            console.error('Error al buscar clientes:', error);
            throw error;
        }
    }

    /**
     * Obtener estadísticas de clientes
     */
    async obtenerEstadisticas() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN apellido IS NOT NULL AND apellido != '' THEN 1 END) as con_apellido,
                    COUNT(CASE WHEN cel IS NOT NULL AND cel != '' THEN 1 END) as con_celular,
                    COUNT(CASE WHEN correo IS NOT NULL AND correo != '' THEN 1 END) as con_correo
                FROM ${this.tableName}
            `;

            const rows = await this.db.query(query);
            return rows[0];

        } catch (error) {
            console.error('Error al obtener estadísticas de clientes:', error);
            throw error;
        }
    }

    /**
     * Buscar por celular
     */
    async buscarPorCelular(cel) {
        try {
            return await this.findOne({ cel });
        } catch (error) {
            console.error('Error al buscar cliente por celular:', error);
            throw error;
        }
    }

    /**
     * Buscar por correo
     */
    async buscarPorCorreo(correo) {
        try {
            return await this.findOne({ correo });
        } catch (error) {
            console.error('Error al buscar cliente por correo:', error);
            throw error;
        }
    }
}

module.exports = Cliente;