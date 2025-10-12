/**
 * Servidor simple para probar funcionalidad básica
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar la configuración de base de datos
const database = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'Sistema Inmobiliario - Servidor de Prueba',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Ruta para verificar la base de datos
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

// Importar rutas necesarias
const authRoutes = require('./src/routes/auth');
const propietariosRoutes = require('./src/routes/propietarios');

app.use('/api/auth', authRoutes);
app.use('/api/propietarios', propietariosRoutes);

// Iniciar servidor
async function startServer() {
    try {
        console.log('🔄 Iniciando servidor de prueba...');
        
        // Probar conexión a BD
        await database.testConnection();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`📁 Archivos estáticos: ${path.join(__dirname, 'public')}`);
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Manejar cierre del servidor
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando servidor...');
    try {
        await database.close();
        console.log('✅ Conexión a base de datos cerrada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cerrar:', error.message);
        process.exit(1);
    }
});

startServer();