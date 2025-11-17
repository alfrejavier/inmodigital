/**
 * Script para verificar el estado de la implementación de propiedades
 */
const database = require('./src/config/database');

async function verificarEstado() {
    try {
        console.log('🔍 VERIFICANDO ESTADO DE PROPIEDADES\n');
        console.log('=' .repeat(60));

        // 1. Verificar tabla propiedades
        console.log('\n📋 1. VERIFICANDO TABLA PROPIEDADES...');
        const tablas = await database.query("SHOW TABLES LIKE 'propiedades'");
        
        if (tablas.length > 0) {
            console.log('   ✅ Tabla propiedades EXISTE');
            
            // Ver estructura de la tabla
            const estructura = await database.query('DESCRIBE propiedades');
            console.log('\n   📊 Estructura de la tabla:');
            console.table(estructura.map(c => ({
                Campo: c.Field,
                Tipo: c.Type,
                Nulo: c.Null,
                Default: c.Default
            })));

            // Contar registros
            const count = await database.query('SELECT COUNT(*) as total FROM propiedades');
            console.log(`\n   📈 Total de propiedades registradas: ${count[0].total}`);

            // Ver algunos registros
            if (count[0].total > 0) {
                const propiedades = await database.query(`
                    SELECT id, tipo_propiedad, ciudad, precio, disponibilidad 
                    FROM propiedades 
                    LIMIT 5
                `);
                console.log('\n   🏠 Últimas propiedades:');
                console.table(propiedades);
            }
        } else {
            console.log('   ❌ Tabla propiedades NO EXISTE');
        }

        // 2. Verificar modelo
        console.log('\n=' .repeat(60));
        console.log('\n📄 2. VERIFICANDO MODELO PROPIEDAD...');
        try {
            const Propiedad = require('./src/models/Propiedad');
            console.log('   ✅ Modelo Propiedad.js existe y se puede importar');
            
            // Verificar métodos estáticos
            const metodos = [
                'validarDatos',
                'crear',
                'actualizar',
                'obtenerPorId',
                'obtenerPorIdConPropietario',
                'obtenerConFiltros',
                'contarConFiltros',
                'obtenerPorPropietario',
                'verificarPropietarioExiste',
                'obtenerEstadisticas',
                'eliminar'
            ];

            console.log('\n   🔧 Métodos del modelo:');
            metodos.forEach(metodo => {
                const existe = typeof Propiedad[metodo] === 'function';
                console.log(`      ${existe ? '✅' : '❌'} ${metodo}`);
            });
        } catch (error) {
            console.log('   ❌ Error al cargar el modelo:', error.message);
        }

        // 3. Verificar controlador
        console.log('\n=' .repeat(60));
        console.log('\n🎮 3. VERIFICANDO CONTROLADOR...');
        try {
            const PropiedadController = require('./src/controllers/PropiedadController');
            console.log('   ✅ Controlador PropiedadController.js existe');
            
            const metodos = [
                'obtenerTodas',
                'obtenerPorId',
                'crear',
                'actualizar',
                'eliminar',
                'cambiarDisponibilidad',
                'obtenerPorPropietario',
                'obtenerEstadisticas'
            ];

            console.log('\n   🔧 Métodos del controlador:');
            metodos.forEach(metodo => {
                const existe = typeof PropiedadController[metodo] === 'function';
                console.log(`      ${existe ? '✅' : '❌'} ${metodo}`);
            });
        } catch (error) {
            console.log('   ❌ Error al cargar el controlador:', error.message);
        }

        // 4. Verificar rutas
        console.log('\n=' .repeat(60));
        console.log('\n🛣️  4. VERIFICANDO RUTAS...');
        try {
            const fs = require('fs');
            const rutasPath = './src/routes/propiedades.routes.js';
            
            if (fs.existsSync(rutasPath)) {
                console.log('   ✅ Archivo de rutas propiedades.routes.js existe');
                const contenido = fs.readFileSync(rutasPath, 'utf8');
                
                // Buscar definiciones de rutas
                const rutasEncontradas = contenido.match(/router\.(get|post|put|delete|patch)\(/g) || [];
                console.log(`\n   📍 Rutas definidas: ${rutasEncontradas.length}`);
                
                const metodos = {
                    get: (contenido.match(/router\.get\(/g) || []).length,
                    post: (contenido.match(/router\.post\(/g) || []).length,
                    put: (contenido.match(/router\.put\(/g) || []).length,
                    delete: (contenido.match(/router\.delete\(/g) || []).length,
                    patch: (contenido.match(/router\.patch\(/g) || []).length
                };

                console.log('\n   📊 Rutas por método:');
                Object.entries(metodos).forEach(([metodo, cantidad]) => {
                    if (cantidad > 0) {
                        console.log(`      ${metodo.toUpperCase()}: ${cantidad}`);
                    }
                });
            } else {
                console.log('   ❌ Archivo de rutas propiedades.routes.js NO EXISTE');
            }
        } catch (error) {
            console.log('   ❌ Error al verificar rutas:', error.message);
        }

        console.log('\n=' .repeat(60));
        console.log('\n✅ VERIFICACIÓN COMPLETADA\n');
        
        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERROR EN LA VERIFICACIÓN:', error);
        process.exit(1);
    }
}

// Ejecutar verificación
verificarEstado();
