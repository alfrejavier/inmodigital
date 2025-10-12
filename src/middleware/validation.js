/**
 * Middleware para validaciones comunes
 */

/**
 * Validar que el ID sea un número entero positivo
 */
const validarId = (req, res, next) => {
    const { id } = req.params;
    
    if (isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El ID debe ser un número entero positivo'
        });
    }
    
    req.params.id = parseInt(id);
    next();
};

/**
 * Validar que el documento sea un número entero positivo
 */
const validarDocumento = (req, res, next) => {
    const { documento } = req.params;
    
    if (isNaN(documento) || parseInt(documento) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'El documento debe ser un número entero positivo'
        });
    }
    
    req.params.documento = parseInt(documento);
    next();
};

/**
 * Validar paginación
 */
const validarPaginacion = (req, res, next) => {
    let { page = 1, limit = 10 } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    
    if (isNaN(page) || page < 1) {
        page = 1;
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
        limit = 10;
    }
    
    req.query.page = page;
    req.query.limit = limit;
    
    next();
};

/**
 * Validar fechas
 */
const validarFechas = (req, res, next) => {
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (fecha_inicio && isNaN(Date.parse(fecha_inicio))) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio no es válida'
        });
    }
    
    if (fecha_fin && isNaN(Date.parse(fecha_fin))) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de fin no es válida'
        });
    }
    
    if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
        return res.status(400).json({
            success: false,
            message: 'La fecha de inicio no puede ser mayor que la fecha de fin'
        });
    }
    
    next();
};

/**
 * Validar que el cuerpo de la petición no esté vacío
 */
const validarCuerpoRequerido = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El cuerpo de la petición es requerido'
        });
    }
    
    next();
};

/**
 * Sanitizar strings en el body
 */
const sanitizarStrings = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    
    next();
};

/**
 * Validar estados de disponibilidad
 */
const validarEstadoDisponibilidad = (req, res, next) => {
    const { disponibilidad } = req.body;
    
    if (disponibilidad) {
        const estadosValidos = ['disponible', 'vendida', 'reservada', 'retirada'];
        if (!estadosValidos.includes(disponibilidad)) {
            return res.status(400).json({
                success: false,
                message: `Estado de disponibilidad inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }
    }
    
    next();
};

/**
 * Validar estados de venta
 */
const validarEstadoVenta = (req, res, next) => {
    const { estado } = req.body;
    
    if (estado) {
        const estadosValidos = ['pendiente', 'en_proceso', 'completada', 'cancelada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: `Estado de venta inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
            });
        }
    }
    
    next();
};

/**
 * Middleware para logs de acceso a endpoints
 */
const logAcceso = (entidad) => {
    return (req, res, next) => {
        const timestamp = new Date().toISOString();
        const metodo = req.method;
        const ruta = req.originalUrl;
        const ip = req.ip || req.connection.remoteAddress;
        
        console.log(`${timestamp} - ${metodo} ${ruta} - IP: ${ip} - Entidad: ${entidad}`);
        next();
    };
};

module.exports = {
    validarId,
    validarDocumento,
    validarPaginacion,
    validarFechas,
    validarCuerpoRequerido,
    sanitizarStrings,
    validarEstadoDisponibilidad,
    validarEstadoVenta,
    logAcceso
};