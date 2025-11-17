const Foto = require('../models/Foto');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuración de Multer
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const propiedadId = req.params.propiedadId || req.params.id;
        const uploadPath = path.join(__dirname, '../../public/uploads/propiedades', propiedadId.toString());
        
        try {
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `foto-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG y WEBP'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

/**
 * Controlador para la gestión de fotos
 */
class FotoController {

    /**
     * Middleware de multer para subir fotos
     */
    static get uploadMiddleware() {
        return upload.array('fotos', 10); // Máximo 10 fotos a la vez
    }

    /**
     * Obtener todas las fotos de una propiedad
     */
    static async obtenerPorPropiedad(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const fotos = await Foto.obtenerPorPropiedad(parseInt(propiedadId));
            
            res.json({
                success: true,
                data: fotos,
                total: fotos.length
            });

        } catch (error) {
            console.error('Error al obtener fotos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Subir fotos de una propiedad
     */
    static async subir(req, res) {
        try {
            const { propiedadId } = req.params;

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No se enviaron archivos'
                });
            }

            const fotosCreadas = [];
            
            for (const file of req.files) {
                const rutaRelativa = `/uploads/propiedades/${propiedadId}/${file.filename}`;
                
                const fotoData = {
                    ruta: rutaRelativa,
                    propiedades_id: parseInt(propiedadId)
                };

                const fotoCreada = await Foto.crear(fotoData);
                fotosCreadas.push({
                    id: fotoCreada.id,
                    ruta: rutaRelativa,
                    propiedades_id: parseInt(propiedadId)
                });
            }

            res.json({
                success: true,
                message: `${fotosCreadas.length} foto(s) subida(s) exitosamente`,
                data: fotosCreadas
            });

        } catch (error) {
            console.error('Error al subir fotos:', error);
            
            // Si hay error, eliminar archivos subidos
            if (req.files) {
                for (const file of req.files) {
                    try {
                        await fs.unlink(file.path);
                    } catch (unlinkError) {
                        console.error('Error al eliminar archivo:', unlinkError);
                    }
                }
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar una foto
     */
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            const eliminada = await Foto.eliminar(parseInt(id));
            
            if (!eliminada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró foto con ID ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Foto eliminada exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar foto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Eliminar todas las fotos de una propiedad
     */
    static async eliminarPorPropiedad(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const cantidadEliminada = await Foto.eliminarPorPropiedad(parseInt(propiedadId));
            
            res.json({
                success: true,
                message: `${cantidadEliminada} foto(s) eliminada(s) exitosamente`,
                cantidadEliminada
            });

        } catch (error) {
            console.error('Error al eliminar fotos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = FotoController;