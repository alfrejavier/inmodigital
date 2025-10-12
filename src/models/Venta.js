const BaseModel = require('./BaseModel');

/**
 * Modelo para la tabla ventas
 */
class Venta extends BaseModel {
    constructor() {
        super('ventas', 'idventas');
    }

    /**
     * Crear una nueva venta
     */
    async crear(data) {
        // Validar datos requeridos
        this.validarDatosRequeridos(data);
        
        // Verificar que la propiedad exista y esté disponible
        await this.verificarPropiedad(data.propiedades_id);
        
        // Verificar que el cliente exista
        await this.verificarCliente(data.clientes_documento);

        // Crear la venta
        const venta = await this.create(data);

        // Si la venta se completó, cambiar el estado de la propiedad
        if (data.estado === 'completada') {
            await this.cambiarEstadoPropiedad(data.propiedades_id, 'vendida');
        }

        return venta;
    }

    /**
     * Actualizar venta
     */
    async actualizar(id, data) {
        const venta = await this.findById(id);
        if (!venta) {
            throw new Error(`No se encontró venta con ID ${id}`);
        }

        // Si se está cambiando la propiedad, verificarla
        if (data.propiedades_id) {
            await this.verificarPropiedad(data.propiedades_id);
        }

        // Si se está cambiando el cliente, verificarlo
        if (data.clientes_documento) {
            await this.verificarCliente(data.clientes_documento);
        }

        // Actualizar la venta
        const ventaActualizada = await this.update(id, data);

        // Manejar cambios de estado
        if (data.estado) {
            await this.manejarCambioEstado(venta, data.estado);
        }

        return ventaActualizada;
    }

    /**
     * Obtener ventas con información completa
     */
    async obtenerConDetalles(id = null) {
        let sql = `
            SELECT 
                v.*,
                p.tipo_propiedad,
                p.ubicacion,
                p.precio as precio_propiedad,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                c.cel as cliente_cel,
                pr.nombre as propietario_nombre,
                pr.apellido1 as propietario_apellido1,
                pr.cel as propietario_cel
            FROM ${this.tableName} v
            INNER JOIN propiedades p ON v.propiedades_id = p.id
            INNER JOIN clientes c ON v.clientes_documento = c.documento
            INNER JOIN propietarios pr ON p.propietarios_documento = pr.documento
        `;
        const params = [];

        if (id) {
            sql += ` WHERE v.idventas = ?`;
            params.push(id);
        }

        sql += ` ORDER BY v.fecha DESC`;

        const result = await this.db.query(sql, params);
        return id ? (result[0] || null) : result;
    }

    /**
     * Obtener ventas por estado
     */
    async obtenerPorEstado(estado) {
        return await this.obtenerConDetalles().then(ventas => 
            ventas.filter(venta => venta.estado === estado)
        );
    }

    /**
     * Obtener ventas de un periodo específico
     */
    async obtenerPorPeriodo(fechaInicio, fechaFin) {
        const sql = `
            SELECT v.*, 
                   p.tipo_propiedad, p.ubicacion, p.precio as precio_propiedad,
                   c.nombre as cliente_nombre, c.apellido as cliente_apellido
            FROM ${this.tableName} v
            INNER JOIN propiedades p ON v.propiedades_id = p.id
            INNER JOIN clientes c ON v.clientes_documento = c.documento
            WHERE v.fecha BETWEEN ? AND ?
            ORDER BY v.fecha DESC
        `;
        return await this.db.query(sql, [fechaInicio, fechaFin]);
    }

    /**
     * Obtener estadísticas de ventas
     */
    async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
        let sql = `
            SELECT 
                COUNT(*) as total_ventas,
                COUNT(CASE WHEN estado = 'completada' THEN 1 END) as ventas_completadas,
                COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as ventas_pendientes,
                COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as ventas_canceladas,
                SUM(CASE WHEN estado = 'completada' THEN valorventa ELSE 0 END) as valor_total_ventas,
                AVG(CASE WHEN estado = 'completada' THEN valorventa END) as valor_promedio_ventas,
                MAX(CASE WHEN estado = 'completada' THEN valorventa END) as venta_maxima,
                MIN(CASE WHEN estado = 'completada' THEN valorventa END) as venta_minima
            FROM ${this.tableName}
        `;
        const params = [];

        if (fechaInicio && fechaFin) {
            sql += ` WHERE fecha BETWEEN ? AND ?`;
            params.push(fechaInicio, fechaFin);
        }

        const result = await this.db.query(sql, params);
        return result[0];
    }

    /**
     * Obtener ventas por mes
     */
    async obtenerVentasPorMes(año) {
        const sql = `
            SELECT 
                MONTH(fecha) as mes,
                COUNT(*) as cantidad_ventas,
                SUM(CASE WHEN estado = 'completada' THEN valorventa ELSE 0 END) as valor_total
            FROM ${this.tableName}
            WHERE YEAR(fecha) = ? AND estado = 'completada'
            GROUP BY MONTH(fecha)
            ORDER BY mes
        `;
        return await this.db.query(sql, [año]);
    }

    /**
     * Cambiar estado de una venta
     */
    async cambiarEstado(id, nuevoEstado) {
        const estadosValidos = ['pendiente', 'en_proceso', 'completada', 'cancelada'];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error(`Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`);
        }

        const venta = await this.findById(id);
        if (!venta) {
            throw new Error(`No se encontró venta con ID ${id}`);
        }

        await this.manejarCambioEstado(venta, nuevoEstado);
        return await this.update(id, { estado: nuevoEstado });
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
            await this.cambiarEstadoPropiedad(venta.propiedades_id, 'disponible');
        }
        
        // Si se pone en proceso, reservar la propiedad
        if (nuevoEstado === 'en_proceso' && estadoAnterior === 'pendiente') {
            await this.cambiarEstadoPropiedad(venta.propiedades_id, 'reservada');
        }
    }

    /**
     * Cambiar estado de la propiedad
     */
    async cambiarEstadoPropiedad(propiedadId, nuevoEstado) {
        const sql = `UPDATE propiedades SET disponibilidad = ? WHERE id = ?`;
        await this.db.query(sql, [nuevoEstado, propiedadId]);
    }

    /**
     * Verificar que la propiedad exista y esté disponible
     */
    async verificarPropiedad(propiedadId) {
        const sql = `SELECT * FROM propiedades WHERE id = ?`;
        const result = await this.db.query(sql, [propiedadId]);
        
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
        const result = await this.db.query(sql, [documento]);
        
        if (result[0].existe === 0) {
            throw new Error(`No existe un cliente con documento ${documento}`);
        }
        
        return true;
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

        if (!Number.isInteger(data.clientes_documento) || data.clientes_documento <= 0) {
            throw new Error('El documento del cliente debe ser un número entero positivo');
        }
    }
}

module.exports = Venta;