const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar la configuración de base de datos
const database = require('./src/config/database');

// Crear la aplicación Express
const app = express();

// Configuración del puerto
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.path}`);
    next();
});

// Ruta de inicio
app.get('/', (req, res) => {
    res.json({
        message: '🏠 API Sistema Inmobiliario - Servidor de Pruebas',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            propietarios: '/api/propietarios',
            clientes: '/api/clientes',
            propiedades: '/api/propiedades',
            ventas: '/api/ventas',
            fotos: '/api/fotos',
            caracteristicas: '/api/caracteristicas'
        },
        ejemplos: {
            'GET todos los propietarios': '/api/propietarios',
            'GET propietario específico': '/api/propietarios/12345678',
            'POST crear propietario': '/api/propietarios (con body JSON)',
            'PUT actualizar propietario': '/api/propietarios/12345678 (con body JSON)',
            'DELETE eliminar propietario': '/api/propietarios/12345678'
        }
    });
});

// Ruta para verificar el estado de la base de datos
app.get('/api/health', async (req, res) => {
    try {
        const result = await database.query('SELECT COUNT(*) as total FROM propietarios');
        res.json({
            status: 'OK',
            message: 'Base de datos conectada correctamente',
            data: {
                totalPropietarios: result[0].total,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error de conexión a la base de datos',
            error: error.message
        });
    }
});

// Importar y configurar las rutas
const propietariosRoutes = require('./src/routes/propietarios');
const clientesRoutes = require('./src/routes/clientes');
const propiedadesRoutes = require('./src/routes/propiedades');
const ventasRoutes = require('./src/routes/ventas');
const fotosRoutes = require('./src/routes/fotos');
const caracteristicasRoutes = require('./src/routes/caracteristicas');

// Usar las rutas
app.use('/api/propietarios', propietariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/propiedades', propiedadesRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/fotos', fotosRoutes);
app.use('/api/caracteristicas', caracteristicasRoutes);

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.method} ${req.path} no existe`,
        availableRoutes: {
            propietarios: '/api/propietarios',
            clientes: '/api/clientes',
            propiedades: '/api/propiedades',
            ventas: '/api/ventas',
            fotos: '/api/fotos',
            caracteristicas: '/api/caracteristicas'
        }
    });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
        timestamp: new Date().toISOString()
    });
});

// Función para iniciar el servidor
async function startServer() {
    try {
        // Probar la conexión a la base de datos
        await database.testConnection();
        console.log('✅ Conexión a la base de datos establecida');

        // Iniciar el servidor
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor de pruebas ejecutándose en http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Base de datos: ${process.env.DB_NAME}`);
            console.log('\n🔗 ENDPOINTS DISPONIBLES:');
            console.log(`   📋 GET    http://localhost:${PORT}/api/propietarios`);
            console.log(`   ➕ POST   http://localhost:${PORT}/api/propietarios`);
            console.log(`   🔍 GET    http://localhost:${PORT}/api/propietarios/:documento`);
            console.log(`   ✏️  PUT    http://localhost:${PORT}/api/propietarios/:documento`);
            console.log(`   🗑️  DELETE http://localhost:${PORT}/api/propietarios/:documento`);
            console.log(`   📊 GET    http://localhost:${PORT}/api/health`);
            console.log('\n💡 Para probar, abre tu navegador o usa herramientas como Postman');
        });

        return server;

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

// Manejar cierre graceful del servidor
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor de pruebas...');
    try {
        await database.close();
        console.log('✅ Conexión a base de datos cerrada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cerrar la conexión:', error.message);
        process.exit(1);
    }
});

// Iniciar el servidor
startServer();

module.exports = app;