const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Configuración de multer para subida de archivos
 */

// Configuración de almacenamiento para propiedades
const storagePropiedades = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/images/propiedades');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único con timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'propiedad-' + uniqueSuffix + extension);
    }
});

// Configuración de almacenamiento para productos
const storageProductos = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../public/uploads/productos');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generar nombre único con timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'producto-' + uniqueSuffix + extension);
    }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
};

// Configuración de multer para propiedades
const uploadPropiedades = multer({
    storage: storagePropiedades,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
    },
    fileFilter: fileFilter
});

// Configuración de multer para productos
const uploadProductos = multer({
    storage: storageProductos,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
    },
    fileFilter: fileFilter
});

module.exports = {
    // Subir una sola imagen de propiedad
    single: uploadPropiedades.single('foto'),
    
    // Subir múltiples imágenes de propiedades (máximo 10)
    multiple: uploadPropiedades.array('fotos', 10),
    
    // Subir una sola imagen de producto
    singleProducto: uploadProductos.single('imagen'),
    
    // Manejo de errores de multer
    handleMulterError: (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'El archivo es demasiado grande. Máximo 5MB permitido.'
                });
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Demasiados archivos. Máximo 10 archivos permitidos.'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Campo de archivo inesperado.'
                });
            }
        }
        
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error al procesar archivo'
            });
        }
        
        next();
    }
};