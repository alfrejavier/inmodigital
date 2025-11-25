const BaseModel = require('./BaseModel');
const database = require('../config/database');

/**
 * Modelo para la tabla productos
 */
class Producto extends BaseModel {
    constructor() {
        super('productos', 'id_producto');
    }

    /**
     * Crear un nuevo producto (método estático)
     */
    static async crear(data) {
        const instancia = new Producto();
        
        // Validar datos requeridos
        if (!data.nombre || !data.precio || data.cantidad === undefined) {
            throw new Error('Los campos nombre, precio y cantidad son requeridos');
        }

        // Validar precio
        if (data.precio <= 0) {
            throw new Error('El precio debe ser mayor a cero');
        }

        // Validar cantidad
        if (data.cantidad < 0) {
            throw new Error('La cantidad no puede ser negativa');
        }

        // Crear el producto
        return await instancia.create(data);
    }

    /**
     * Obtener todos los productos (método estático)
     */
    static async obtenerTodos(filtros = {}) {
        try {
            let sql = 'SELECT * FROM productos WHERE 1=1';
            const params = [];

            // Filtro por marca
            if (filtros.marca) {
                sql += ' AND marca = ?';
                params.push(filtros.marca);
            }

            // Filtro por estado
            if (filtros.estado) {
                sql += ' AND estado = ?';
                params.push(filtros.estado);
            }

            // Filtro por búsqueda (nombre o descripción)
            if (filtros.search) {
                sql += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
                params.push('%' + filtros.search + '%', '%' + filtros.search + '%');
            }

            // Filtro por stock bajo
            if (filtros.stock_bajo) {
                sql += ' AND cantidad <= stock_minimo';
            }

            sql += ' ORDER BY fecha_registro DESC';

            const productos = await database.query(sql, params);
            return productos;
        } catch (error) {
            console.error(' Error al obtener productos:', error);
            throw error;
        }
    }

    /**
     * Obtener un producto por ID (método estático)
     */
    static async obtenerPorId(id) {
        const instancia = new Producto();
        const producto = await instancia.findById(id);
        return producto;
    }

    /**
     * Actualizar producto (método estático)
     */
    static async actualizar(id, data) {
        const instancia = new Producto();
        const producto = await instancia.findById(id);
        
        if (!producto) {
            throw new Error('No se encontró producto con ID ' + id);
        }

        // Validar precio si se proporciona
        if (data.precio !== undefined && data.precio <= 0) {
            throw new Error('El precio debe ser mayor a cero');
        }

        // Validar cantidad si se proporciona
        if (data.cantidad !== undefined && data.cantidad < 0) {
            throw new Error('La cantidad no puede ser negativa');
        }

        // Actualizar el producto
        return await instancia.update(id, data);
    }

    /**
     * Eliminar producto (método estático)
     */
    static async eliminar(id) {
        const instancia = new Producto();
        const producto = await instancia.findById(id);
        
        if (!producto) {
            throw new Error('No se encontró producto con ID ' + id);
        }

        return await instancia.delete(id);
    }

    /**
     * Actualizar stock (método estático)
     */
    static async actualizarStock(id, operacion, cantidad) {
        const instancia = new Producto();
        const producto = await instancia.findById(id);
        
        if (!producto) {
            throw new Error('No se encontró producto con ID ' + id);
        }

        if (cantidad === undefined || cantidad < 0) {
            throw new Error('La cantidad debe ser un número válido');
        }

        let sql;
        let params;

        // Determinar la operación a realizar
        if (operacion === 'ajustar') {
            // Ajustar: establecer el valor exacto
            sql = `
                UPDATE productos 
                SET cantidad = ?, 
                    fecha_actualizacion = NOW() 
                WHERE id_producto = ?
            `;
            params = [cantidad, id];
        } else {
            // Agregar o Quitar: sumar o restar al stock actual
            const cantidadFinal = operacion === 'agregar' ? cantidad : -cantidad;
            
            sql = `
                UPDATE productos 
                SET cantidad = cantidad + ?, 
                    fecha_actualizacion = NOW() 
                WHERE id_producto = ?
            `;
            params = [cantidadFinal, id];
        }
        
        await db.execute(sql, params);
        
        // Obtener el producto actualizado
        return await instancia.obtenerPorId(id);
    }

    /**
     * Obtener productos con stock bajo (método estático)
     */
    static async obtenerStockBajo() {
        try {
            const sql = `
                SELECT * FROM productos 
                WHERE cantidad <= stock_minimo 
                AND estado = 'activo'
                ORDER BY cantidad ASC
            `;
            
            const productos = await database.query(sql);
            return productos;
        } catch (error) {
            console.error('❌ Error al obtener productos con stock bajo:', error);
            throw error;
        }
    }

    /**
     * Obtener marcas únicas (método estático)
     */
    static async obtenerMarcas() {
        try {
            const sql = `
                SELECT DISTINCT marca 
                FROM productos 
                WHERE marca IS NOT NULL AND marca != ''
                ORDER BY marca ASC
            `;
            
            const marcas = await database.query(sql);
            return marcas.map(m => m.marca);
        } catch (error) {
            console.error('❌ Error al obtener marcas:', error);
            throw error;
        }
    }

    /**
     * Contar productos (método estático)
     */
    static async contar(filtros = {}) {
        const instancia = new Producto();
        return await instancia.count(filtros);
    }
}

module.exports = Producto;
