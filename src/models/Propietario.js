const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla propietarios
 */
class Propietario extends BaseModel {
    constructor() {
        super('propietarios', 'documento');
    }

    /**
     * Crear un nuevo propietario
     */
    async crear(data) {
        try {
            // Validar datos requeridos (esto también sanitiza los datos)
            this.validarDatosRequeridos(data);
            
            // Verificar que no exista el documento
            const existePropietario = await this.exists(data.documento);
            if (existePropietario) {
                throw new Error(`Ya existe un propietario con el documento ${data.documento}`);
            }

            return await this.create(data);
        } catch (error) {
            console.error('Error en Propietario.crear:', error.message);
            throw error;
        }
    }

    /**
     * Actualizar propietario
     */
    async actualizar(documento, data) {
        const propietario = await this.findById(documento);
        if (!propietario) {
            throw new Error(`No se encontró propietario con documento ${documento}`);
        }

        return await this.update(documento, data);
    }

    /**
     * Buscar propietarios por nombre, apellido, documento o correo
     */
    async buscarPorNombre(termino) {
        const sql = `
            SELECT * FROM ${this.tableName} 
            WHERE nombre LIKE ? 
               OR apellido1 LIKE ? 
               OR apellido2 LIKE ? 
               OR documento LIKE ?
               OR correo LIKE ?
            ORDER BY 
                CASE 
                    WHEN documento LIKE ? THEN 1
                    WHEN nombre LIKE ? THEN 2
                    WHEN apellido1 LIKE ? THEN 3
                    ELSE 4
                END,
                nombre, apellido1
        `;
        const parametroBusqueda = `%${termino}%`;
        const parametroExacto = `${termino}%`; // Para búsquedas que empiecen con el término
        
        return await this.db.query(sql, [
            parametroBusqueda, // nombre
            parametroBusqueda, // apellido1
            parametroBusqueda, // apellido2
            parametroBusqueda, // documento
            parametroBusqueda, // correo
            parametroExacto,   // documento (orden)
            parametroExacto,   // nombre (orden)
            parametroExacto    // apellido1 (orden)
        ]);
    }

    /**
     * Obtener propiedades de un propietario
     */
    async obtenerPropiedades(documento) {
        const sql = `
            SELECT p.* FROM propiedades p 
            WHERE p.propietarios_documento = ?
            ORDER BY p.id DESC
        `;
        return await this.db.query(sql, [documento]);
    }

    /**
     * Buscar por teléfono o celular
     */
    async buscarPorTelefono(telefono) {
        const sql = `
            SELECT * FROM ${this.tableName} 
            WHERE tel = ? OR cel = ?
        `;
        return await this.db.query(sql, [telefono, telefono]);
    }

    /**
     * Buscar por correo
     */
    async buscarPorCorreo(correo) {
        return await this.findOne({ correo });
    }

    /**
     * Sanitizar y limpiar datos de entrada
     */
    sanitizarDatos(data) {
        const datosLimpios = { ...data };
        
        // Eliminar campos vacíos o no deseados
        Object.keys(datosLimpios).forEach(key => {
            if (datosLimpios[key] === '' || datosLimpios[key] === null || datosLimpios[key] === undefined) {
                delete datosLimpios[key];
            }
        });

        // Eliminar campo 'id' si existe (no lo usamos en propietarios)
        if ('id' in datosLimpios) {
            delete datosLimpios.id;
        }
        
        // Limpiar strings
        ['nombre', 'apellido1', 'apellido2', 'correo'].forEach(campo => {
            if (datosLimpios[campo]) {
                datosLimpios[campo] = datosLimpios[campo].toString().trim();
            }
        });

        // Limpiar números (teléfonos y documento)
        ['documento', 'tel', 'cel'].forEach(campo => {
            if (datosLimpios[campo]) {
                datosLimpios[campo] = datosLimpios[campo].toString().trim();
            }
        });

        return datosLimpios;
    }

    /**
     * Validar datos requeridos
     */
    validarDatosRequeridos(data) {
        // Primero sanitizar los datos
        const datosLimpios = this.sanitizarDatos(data);
        
        const camposRequeridos = ['documento', 'nombre', 'apellido1', 'cel'];
        
        for (const campo of camposRequeridos) {
            if (!datosLimpios[campo]) {
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Aplicar los datos limpios de vuelta al objeto original
        Object.assign(data, datosLimpios);

        // Validar formato de documento
        // Convertir a string y limpiar espacios
        const documentoStr = data.documento.toString().trim();
        
        // Validar que solo contenga dígitos
        if (!/^\d+$/.test(documentoStr)) {
            throw new Error('El documento debe contener solo números');
        }
        
        const documento = parseInt(documentoStr);
        if (isNaN(documento) || documento <= 0) {
            throw new Error('El documento debe ser un número entero positivo');
        }
        
        // Convertir a número para almacenar
        data.documento = documento;

        // Validar que el nombre no esté vacío
        if (data.nombre.trim().length === 0) {
            throw new Error('El nombre no puede estar vacío');
        }

        // Validar que el primer apellido no esté vacío
        if (data.apellido1.trim().length === 0) {
            throw new Error('El primer apellido no puede estar vacío');
        }

        // Validar celular
        if (data.cel.trim().length === 0) {
            throw new Error('El celular no puede estar vacío');
        }

        // Validar formato de teléfonos si se proporcionan
        if (data.tel && data.tel.trim()) {
            const telStr = data.tel.toString().trim();
            if (!/^\d+$/.test(telStr)) {
                throw new Error('El teléfono debe contener solo números');
            }
        }

        if (data.cel && data.cel.trim()) {
            const celStr = data.cel.toString().trim();
            if (!/^\d+$/.test(celStr)) {
                throw new Error('El celular debe contener solo números');
            }
        }

        // Validar formato de correo si se proporciona
        if (data.correo && data.correo.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.correo.trim())) {
                throw new Error('El formato del correo electrónico no es válido');
            }
        }
    }

    /**
     * Obtener estadísticas del propietario
     */
    async obtenerEstadisticas(documento) {
        const sql = `
            SELECT 
                COUNT(p.id) as total_propiedades,
                COUNT(CASE WHEN p.disponibilidad = 'disponible' THEN 1 END) as propiedades_disponibles,
                COUNT(CASE WHEN p.disponibilidad = 'vendida' THEN 1 END) as propiedades_vendidas,
                AVG(p.precio) as precio_promedio,
                MAX(p.precio) as precio_maximo,
                MIN(p.precio) as precio_minimo
            FROM propiedades p 
            WHERE p.propietarios_documento = ?
        `;
        const result = await this.db.query(sql, [documento]);
        return result[0];
    }
}

module.exports = Propietario;