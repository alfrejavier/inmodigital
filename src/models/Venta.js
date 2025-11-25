const BaseModel = require('./BaseModel');
const database = require('../config/database');

/**
 * Modelo para la tabla ventas
 */
class Venta extends BaseModel {
    constructor() {
        super('ventas', 'idventas');
    }

    /**
     * Crear una nueva venta (método estático)
     */
    static async crear(data) {
        const instancia = new Venta();
        
        // Validar datos requeridos
        instancia.validarDatosRequeridos(data);
        
        // Verificar que la propiedad exista y esté disponible
        await instancia.verificarPropiedad(data.propiedades_id);
        
        // Verificar que el cliente exista
        await instancia.verificarCliente(data.clientes_documento);

        // Crear la venta
        const venta = await instancia.create(data);

        // Si la venta se completó, cambiar el estado de la propiedad
        if (data.estado === 'completada') {
            await instancia.cambiarEstadoPropiedad(data.propiedades_id, 'vendida');
        }

        return venta;
    }

    /**
     * Obtener todas las ventas con detalles (método estático)
     */
    static async obtenerConDetalles(id = null) {
        try {
            let sql = `
                SELECT 
                    v.*,
                    p.tipo_propiedad,
                    p.ubicacion,
                    p.ciudad,
                    p.depto,
                    p.precio as precio_propiedad,
                    c.nombre as nombre_cliente,
                    c.apellido as apellido_cliente,
                    c.cel as cliente_cel,
                    prop.nombre as propietario_nombre,
                    prop.cel as propietario_cel
                FROM ventas v
                INNER JOIN propiedades p ON v.propiedades_id = p.id
                INNER JOIN clientes c ON v.clientes_documento = c.documento
                INNER JOIN propietarios prop ON p.propietarios_documento = prop.documento
            `;
            const params = [];

            if (id) {
                sql += ` WHERE v.idventas = ?`;
                params.push(id);
            }

            sql += ` ORDER BY v.fecha DESC`;

            const result = await database.query(sql, params);
            return id ? (result[0] || null) : result;
        } catch (error) {
            console.error('❌ Error obteniendo ventas:', error);
            throw error;
        }
    }

    /**
     * Actualizar venta (método estático)
     */
    static async actualizar(id, data) {
        const instancia = new Venta();
        const venta = await instancia.findById(id);
        
        if (!venta) {
            throw new Error(`No se encontró venta con ID ${id}`);
        }

        // Si se está cambiando la propiedad, verificarla
        if (data.propiedades_id) {
            await instancia.verificarPropiedad(data.propiedades_id);
        }

        // Si se está cambiando el cliente, verificarlo
        if (data.clientes_documento) {
            await instancia.verificarCliente(data.clientes_documento);
        }

        // Actualizar la venta
        const ventaActualizada = await instancia.update(id, data);

        // Manejar cambios de estado
        if (data.estado) {
            await instancia.manejarCambioEstado(venta, data.estado);
        }

        return ventaActualizada;
    }

    /**
     * Eliminar venta (método estático)
     */
    static async eliminar(id) {
        const instancia = new Venta();
        const venta = await instancia.findById(id);
        
        if (!venta) {
            return false;
        }

        // Si la venta estaba completada, devolver propiedad a disponible
        if (venta.estado === 'completada') {
            await instancia.cambiarEstadoPropiedad(venta.propiedades_id, 'venta');
        }

        return await instancia.delete(id);
    }

    /**
     * Contar total de ventas
     */
    static async contar() {
        try {
            const sql = 'SELECT COUNT(*) as total FROM ventas';
            const result = await database.query(sql);
            return result[0].total;
        } catch (error) {
            console.error('❌ Error contando ventas:', error);
            throw error;
        }
    }

    /**
     * Cambiar estado de la propiedad
     */
    async cambiarEstadoPropiedad(propiedadId, nuevoEstado) {
        const sql = `UPDATE propiedades SET disponibilidad = ? WHERE id = ?`;
        await database.query(sql, [nuevoEstado, propiedadId]);
    }

    /**
     * Verificar que la propiedad exista y esté disponible
     */
    async verificarPropiedad(propiedadId) {
        const sql = `SELECT * FROM propiedades WHERE id = ?`;
        const result = await database.query(sql, [propiedadId]);
        
        if (result.length === 0) {
            throw new Error(`No existe una propiedad con ID ${propiedadId}`);
        }

        const propiedad = result[0];
        if (propiedad.disponibilidad === 'vendida') {
            throw new Error(`La propiedad con ID ${propiedadId} ya está vendida`);
        }

        return propiedad;
    }

    /**
     * Verificar que el cliente exista
     */
    async verificarCliente(documento) {
        const sql = `SELECT COUNT(*) as existe FROM clientes WHERE documento = ?`;
        const result = await database.query(sql, [documento]);
        
        if (result[0].existe === 0) {
            throw new Error(`No existe un cliente con documento ${documento}`);
        }
        
        return true;
    }

    /**
     * Manejar cambio de estado de la venta
     */
    async manejarCambioEstado(venta, nuevoEstado) {
        const estadoAnterior = venta.estado;
        
        // Si se completa la venta, marcar propiedad como vendida
        if (nuevoEstado === 'completada' && estadoAnterior !== 'completada') {
            await this.cambiarEstadoPropiedad(venta.propiedades_id, 'vendida');
        }
        
        // Si se cancela una venta que estaba completada, devolver propiedad a disponible
        if (nuevoEstado === 'cancelada' && estadoAnterior === 'completada') {
            await this.cambiarEstadoPropiedad(venta.propiedades_id, 'venta');
        }
    }

    /**
     * Validar datos requeridos
     */
    validarDatosRequeridos(data) {
        const camposRequeridos = ['propiedades_id', 'clientes_documento', 'fecha', 'estado'];
        
        for (const campo of camposRequeridos) {
            if (!data[campo]) {
                throw new Error(`El campo ${campo} es requerido`);
            }
        }

        // Validar estado
        const estadosValidos = ['pendiente', 'en_proceso', 'completada', 'cancelada'];
        if (!estadosValidos.includes(data.estado)) {
            throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
        }

        // Validar fecha
        const fecha = new Date(data.fecha);
        if (isNaN(fecha.getTime())) {
            throw new Error('La fecha no es válida');
        }

        // Validar valor de venta si se proporciona
        if (data.valorventa && (isNaN(data.valorventa) || data.valorventa < 0)) {
            throw new Error('El valor de venta debe ser un número positivo');
        }

        // Validar IDs
        if (!Number.isInteger(data.propiedades_id) || data.propiedades_id <= 0) {
            throw new Error('El ID de la propiedad debe ser un número entero positivo');
        }

        if (!data.clientes_documento || data.clientes_documento.toString().trim() === '') {
            throw new Error('El documento del cliente es requerido');
        }
    }
}

module.exports = Venta;

module.exports = Venta;