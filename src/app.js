const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar la configuración de base de datos para probar la conexión
const database = require('./config/database');

// Crear la aplicación Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json({ limit: '10mb' })); // Parser de JSON con límite
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parser de URL encoded

// Servir archivos estáticos
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Ruta de prueba para verificar que el servidor funciona
app.get('/', (req, res) => {
    res.json({
        message: 'API Sistema Inmobiliario - Funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            // Autenticación
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                profile: 'GET /api/auth/profile',
                usuarios: 'GET /api/auth/usuarios'
            },
            // Gestión de datos
            propietarios: '/api/propietarios',
            clientes: '/api/clientes',
            propiedades: '/api/propiedades',
            ventas: '/api/ventas',
            fotos: '/api/fotos',
            caracteristicas: '/api/caracteristicas',
            productos: '/api/productos'
        }
    });
});

// Ruta para verificar el estado de la base de datos
app.get('/api/health', async (req, res) => {
    try {
        await database.testConnection();
        res.json({
            status: 'OK',
            database: 'Conectada',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Desconectada',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Importar las rutas
const {
    propietariosRoutes,
    clientesRoutes,
    propiedadesRoutes,
    ventasRoutes,
    fotosRoutes,
    caracteristicasRoutes,
    productosRoutes
} = require('./routes');
const authRoutes = require('./routes/auth');

// Usar las rutas
app.use('/api/auth', authRoutes);
app.use('/api/propietarios', propietariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/propiedades', propiedadesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/fotos', fotosRoutes);
app.use('/api/caracteristicas', caracteristicasRoutes);
app.use('/api/productos', productosRoutes);

// Middleware de manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error global capturado:', err);
    
    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
        timestamp: new Date().toISOString()
    });
});

// Función para iniciar el servidor
async function startServer() {
    try {
        // Probar la conexión a la base de datos antes de iniciar el servidor
        await database.testConnection();
        console.log('✅ Conexión a la base de datos establecida');

        // Crear servidor y manejar errores
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
            console.log(`📁 Archivos estáticos: ${path.join(__dirname, '../public')}`);
        });

        // Manejar errores del servidor
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Error: El puerto ${PORT} ya está siendo utilizado.`);
                console.log(`💡 Puedes:
  1. Detener el proceso que usa el puerto: netstat -ano | findstr :${PORT}
  2. Cambiar el puerto en las variables de entorno
  3. Usar: taskkill /F /PID [PID_DEL_PROCESO]`);
            } else {
                console.error('❌ Error del servidor:', err.message);
            }
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Manejar cierre graceful del servidor
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    try {
        await database.close();
        console.log('✅ Conexión a base de datos cerrada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cerrar la conexión:', error.message);
        process.exit(1);
    }
});

// Iniciar el servidor si este archivo se ejecuta directamente
if (require.main === module) {
    startServer();
}

module.exports = app;