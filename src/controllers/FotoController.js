const { foto } = require('../models');
const path = require('path');
const fs = require('fs').promises;

/**
 * Controlador para la gestión de fotos
 */
class FotoController {

    /**
     * Obtener todas las fotos de una propiedad
     */
    async obtenerPorPropiedad(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const fotos = await foto.obtenerPorPropiedad(parseInt(propiedadId));
            
            // Agregar URL completa a cada foto
            const fotosConUrl = fotos.map(f => ({
                ...f,
                url: `${process.env.BASE_URL || 'http://localhost:3000'}/images/propiedades/${path.basename(f.ruta)}`
            }));

            res.json({
                success: true,
                data: fotosConUrl,
                total: fotosConUrl.length
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
     * Obtener una foto por ID
     */
    async obtenerPorId(req, res) {
        try {
            const { id } = req.params;
            
            const fotoEncontrada = await foto.findById(parseInt(id));
            
            if (!fotoEncontrada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró foto con ID ${id}`
                });
            }

            // Agregar URL completa
            fotoEncontrada.url = `${process.env.BASE_URL || 'http://localhost:3000'}/images/propiedades/${path.basename(fotoEncontrada.ruta)}`;

            res.json({
                success: true,
                data: fotoEncontrada
            });

        } catch (error) {
            console.error('Error al obtener foto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Subir una nueva foto
     */
    async subir(req, res) {
        try {
            const { propiedadId } = req.params;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo'
                });
            }

            // Crear datos para la nueva foto
            const datosFoto = {
                ruta: req.file.path,
                propiedades_id: parseInt(propiedadId)
            };

            const nuevaFoto = await foto.crear(datosFoto);
            
            // Agregar URL completa
            nuevaFoto.url = `${process.env.BASE_URL || 'http://localhost:3000'}/images/propiedades/${req.file.filename}`;

            res.status(201).json({
                success: true,
                message: 'Foto subida exitosamente',
                data: nuevaFoto
            });

        } catch (error) {
            console.error('Error al subir foto:', error);
            
            // Si hay error, eliminar el archivo subido
            if (req.file && req.file.path) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error al eliminar archivo:', unlinkError);
                }
            }

            if (error.message.includes('requerido') || 
                error.message.includes('No existe') ||
                error.message.includes('debe ser')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Actualizar información de una foto
     */
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            
            const fotoActualizada = await foto.update(parseInt(id), req.body);
            
            if (!fotoActualizada) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró foto con ID ${id}`
                });
            }

            res.json({
                success: true,
                message: 'Foto actualizada exitosamente',
                data: fotoActualizada
            });

        } catch (error) {
            console.error('Error al actualizar foto:', error);
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
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            
            const eliminada = await foto.eliminarFoto(parseInt(id));
            
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
    async eliminarPorPropiedad(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const cantidadEliminada = await foto.eliminarPorPropiedad(parseInt(propiedadId));
            
            res.json({
                success: true,
                message: `Se eliminaron ${cantidadEliminada} fotos de la propiedad`,
                cantidad_eliminada: cantidadEliminada
            });

        } catch (error) {
            console.error('Error al eliminar fotos de propiedad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener la foto principal de una propiedad
     */
    async obtenerPrincipal(req, res) {
        try {
            const { propiedadId } = req.params;
            
            const fotoPrincipal = await foto.obtenerPrincipal(parseInt(propiedadId));
            
            if (!fotoPrincipal) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontraron fotos para la propiedad ${propiedadId}`
                });
            }

            // Agregar URL completa
            fotoPrincipal.url = `${process.env.BASE_URL || 'http://localhost:3000'}/images/propiedades/${path.basename(fotoPrincipal.ruta)}`;

            res.json({
                success: true,
                data: fotoPrincipal
            });

        } catch (error) {
            console.error('Error al obtener foto principal:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    /**
     * Obtener estadísticas de fotos
     */
    async obtenerEstadisticas(req, res) {
        try {
            const estadisticas = await foto.obtenerEstadisticas();
            
            res.json({
                success: true,
                data: estadisticas
            });

        } catch (error) {
            console.error('Error al obtener estadísticas de fotos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = new FotoController();