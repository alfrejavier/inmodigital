const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla clientes
 */
class Cliente extends BaseModel {
    constructor() {
        super('clientes', 'documento');
    }

    /**
     * Crear un nuevo cliente
     */
    async crear(data) {
        // Validar datos requeridos
        this.validarDatosRequeridos(data);
        
        // Verificar que no exista el documento
        const existeCliente = await this.exists(data.documento);
        if (existeCliente) {
            throw new Error(`Ya existe un cliente con el documento ${data.documento}`);
        }

        return await this.create(data);
    }

    /**
     * Actualizar cliente
     */
    async actualizar(documento, data) {
        const cliente = await this.findById(documento);
        if (!cliente) {
            throw new Error(`No se encontró cliente con documento ${documento}`);
        }

        return await this.update(documento, data);
    }

    /**
     * Buscar clientes por nombre o apellido
     */
    async buscarPorNombre(termino) {
        const sql = `
            SELECT * FROM ${this.tableName} 
            WHERE nombre LIKE ? OR apellido LIKE ?
            ORDER BY nombre, apellido
        `;
        const parametroBusqueda = `%${termino}%`;
        return await this.db.query(sql, [parametroBusqueda, parametroBusqueda]);
    }

    /**
     * Obtener compras de un cliente
     */
    async obtenerCompras(documento) {
        const sql = `
            SELECT v.*, p.tipo_propiedad, p.ubicacion, p.precio as precio_propiedad
            FROM ventas v 
            INNER JOIN propiedades p ON v.propiedades_id = p.id
            WHERE v.clientes_documento = ?
            ORDER BY v.fecha DESC
        `;
        return await this.db.query(sql, [documento]);
    }

    /**
     * Buscar por teléfono celular
     */
    async buscarPorCelular(celular) {
        return await this.findOne({ cel: celular });
    }

    /**
     * Buscar por correo
     */
    async buscarPorCorreo(correo) {
        return await this.findOne({ correo });
    }

    /**
     * Obtener clientes interesados (que tienen ventas pendientes)
     */
    async obtenerClientesInteresados() {
        const sql = `
            SELECT DISTINCT c.*, v.estado as estado_venta
            FROM ${this.tableName} c
            INNER JOIN ventas v ON c.documento = v.clientes_documento
            WHERE v.estado IN ('pendiente', 'en_proceso')
            ORDER BY c.nombre, c.apellido
        `;
        return await this.db.query(sql);
    }

    /**
     * Validar datos requeridos
     */
    validarDatosRequeridos(data) {
        const camposRequeridos = ['documento', 'nombre', 'apellido', 'cel'];
        
        for (const campo of camposRequeridos) {
            if (!data[campo]) {
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Validar formato de documento
        if (!Number.isInteger(data.documento) || data.documento <= 0) {
            throw new Error('El documento debe ser un número entero positivo');
        }

        // Validar que el nombre no esté vacío
        if (data.nombre.trim().length === 0) {
            throw new Error('El nombre no puede estar vacío');
        }

        // Validar que el apellido no esté vacío
        if (data.apellido.trim().length === 0) {
            throw new Error('El apellido no puede estar vacío');
        }

        // Validar celular (13 caracteres máximo según la BD)
        if (data.cel.trim().length === 0 || data.cel.length > 13) {
            throw new Error('El celular no puede estar vacío y debe tener máximo 13 caracteres');
        }

        // Validar correo si se proporciona
        if (data.correo && data.correo.trim().length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.correo)) {
                throw new Error('El formato del correo electrónico no es válido');
            }
        }
    }

    /**
     * Obtener estadísticas del cliente
     */
    async obtenerEstadisticas(documento) {
        const sql = `
            SELECT 
                COUNT(v.idventas) as total_compras,
                COUNT(CASE WHEN v.estado = 'completada' THEN 1 END) as compras_completadas,
                COUNT(CASE WHEN v.estado = 'pendiente' THEN 1 END) as compras_pendientes,
                SUM(CASE WHEN v.estado = 'completada' THEN v.valorventa ELSE 0 END) as valor_total_compras,
                AVG(CASE WHEN v.estado = 'completada' THEN v.valorventa END) as valor_promedio_compras
            FROM ventas v 
            WHERE v.clientes_documento = ?
        `;
        const result = await this.db.query(sql, [documento]);
        return result[0];
    }

    /**
     * Obtener historial de interacciones del cliente
     */
    async obtenerHistorial(documento) {
        const sql = `
            SELECT 
                'venta' as tipo,
                v.fecha as fecha,
                v.estado,
                v.valorventa as valor,
                p.tipo_propiedad,
                p.ubicacion
            FROM ventas v
            INNER JOIN propiedades p ON v.propiedades_id = p.id
            WHERE v.clientes_documento = ?
            ORDER BY v.fecha DESC
        `;
        return await this.db.query(sql, [documento]);
    }
}

module.exports = Cliente;