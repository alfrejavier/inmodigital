// Test simple usando curl equivalente
console.log('Iniciando servidor y pruebas...');

// Primero, crear un servidor de prueba simple
const express = require('express');
const { propietario } = require('./src/models');

const app = express();
app.use(express.json());

// Ruta de prueba simple para propietarios
app.get('/test/propietarios', async (req, res) => {
    try {
        console.log('📋 Probando: Obtener todos los propietarios...');
        const propietarios = await propietario.findAll();
        
        res.json({
            success: true,
            test: 'Obtener todos los propietarios',
            total: propietarios.length,
            data: propietarios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            test: 'Obtener todos los propietarios',
            error: error.message
        });
    }
});

app.post('/test/propietarios', async (req, res) => {
    try {
        console.log('✏️ Probando: Crear propietario...');
        const nuevoPropietario = await propietario.crear({
            documento: 12345678,
            nombre: "Juan Carlos",
            apellido1: "Pérez",
            apellido2: "González",
            tel: 1234567,
            cel: "3001234567",
            correo: "juan.perez@email.com"
        });
        
        res.json({
            success: true,
            test: 'Crear propietario',
            message: 'Propietario creado exitosamente',
            data: nuevoPropietario
        });
    } catch (error) {
        res.json({
            success: false,
            test: 'Crear propietario',
            error: error.message
        });
    }
});

app.get('/test/propietarios/:documento', async (req, res) => {
    try {
        console.log('🔍 Probando: Buscar propietario por documento...');
        const { documento } = req.params;
        const propietarioEncontrado = await propietario.findById(parseInt(documento));
        
        res.json({
            success: true,
            test: 'Buscar propietario por documento',
            encontrado: propietarioEncontrado ? true : false,
            data: propietarioEncontrado
        });
    } catch (error) {
        res.json({
            success: false,
            test: 'Buscar propietario por documento',
            error: error.message
        });
    }
});

// Ruta para ejecutar todos los tests
app.get('/test/run', async (req, res) => {
    const resultados = [];
    
    try {
        // Test 1: Verificar conexión
        console.log('\n🧪 INICIANDO PRUEBAS DE PROPIETARIOS\n');
        
        // Test 2: Obtener todos (debería estar vacío inicialmente)
        console.log('1️⃣ Test: Obtener todos los propietarios');
        try {
            const todos = await propietario.findAll();
            resultados.push({
                test: 1,
                nombre: 'Obtener todos los propietarios',
                success: true,
                total: todos.length,
                data: todos
            });
            console.log(`✅ Éxito: Encontrados ${todos.length} propietarios`);
        } catch (error) {
            resultados.push({
                test: 1,
                nombre: 'Obtener todos los propietarios',
                success: false,
                error: error.message
            });
            console.log(`❌ Error: ${error.message}`);
        }
        
        // Test 3: Crear propietario
        console.log('\n2️⃣ Test: Crear propietario');
        try {
            const nuevoPropietario = await propietario.crear({
                documento: 12345678,
                nombre: "Juan Carlos",
                apellido1: "Pérez",
                apellido2: "González",
                tel: 1234567,
                cel: "3001234567",
                correo: "juan.perez@email.com"
            });
            
            resultados.push({
                test: 2,
                nombre: 'Crear propietario',
                success: true,
                data: nuevoPropietario
            });
            console.log(`✅ Éxito: Propietario creado - ${nuevoPropietario.nombre} ${nuevoPropietario.apellido1}`);
        } catch (error) {
            resultados.push({
                test: 2,
                nombre: 'Crear propietario',
                success: false,
                error: error.message
            });
            console.log(`❌ Error: ${error.message}`);
        }
        
        // Test 4: Buscar por documento
        console.log('\n3️⃣ Test: Buscar propietario por documento');
        try {
            const propietarioEncontrado = await propietario.findById(12345678);
            resultados.push({
                test: 3,
                nombre: 'Buscar por documento',
                success: propietarioEncontrado ? true : false,
                encontrado: propietarioEncontrado ? true : false,
                data: propietarioEncontrado
            });
            
            if (propietarioEncontrado) {
                console.log(`✅ Éxito: Propietario encontrado - ${propietarioEncontrado.nombre}`);
            } else {
                console.log(`⚠️ No encontrado: Propietario con documento 12345678`);
            }
        } catch (error) {
            resultados.push({
                test: 3,
                nombre: 'Buscar por documento',
                success: false,
                error: error.message
            });
            console.log(`❌ Error: ${error.message}`);
        }
        
        // Test 5: Actualizar propietario
        console.log('\n4️⃣ Test: Actualizar propietario');
        try {
            const propietarioActualizado = await propietario.actualizar(12345678, {
                tel: 7654321,
                correo: "juan.actualizado@email.com"
            });
            
            resultados.push({
                test: 4,
                nombre: 'Actualizar propietario',
                success: true,
                data: propietarioActualizado
            });
            console.log(`✅ Éxito: Propietario actualizado - nuevo email: ${propietarioActualizado.correo}`);
        } catch (error) {
            resultados.push({
                test: 4,
                nombre: 'Actualizar propietario',
                success: false,
                error: error.message
            });
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log('\n🎉 PRUEBAS COMPLETADAS\n');
        
        res.json({
            success: true,
            mensaje: 'Todas las pruebas ejecutadas',
            total_tests: resultados.length,
            tests_exitosos: resultados.filter(r => r.success).length,
            tests_fallidos: resultados.filter(r => !r.success).length,
            resultados: resultados
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error general en las pruebas',
            mensaje: error.message
        });
    }
});

const PORT = 3001;
app.listen(PORT, async () => {
    console.log(`\n🚀 Servidor de pruebas ejecutándose en http://localhost:${PORT}`);
    console.log(`\n📋 Rutas disponibles:`);
    console.log(`   GET  /test/run                    - Ejecutar todas las pruebas`);
    console.log(`   GET  /test/propietarios           - Listar propietarios`);
    console.log(`   POST /test/propietarios           - Crear propietario`);
    console.log(`   GET  /test/propietarios/:documento - Buscar por documento`);
    console.log(`\n🔗 Para ejecutar las pruebas, visita: http://localhost:${PORT}/test/run`);
    console.log(`\n💡 O usa: Invoke-RestMethod -Uri "http://localhost:${PORT}/test/run" -Method Get`);
});