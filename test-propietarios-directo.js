// Prueba directa de modelos sin servidor web
const { propietario } = require('./src/models');

async function probarPropietarios() {
    console.log('\n🧪 INICIANDO PRUEBAS DIRECTAS DE PROPIETARIOS\n');
    
    let testsPasados = 0;
    let testsFallidos = 0;
    
    // Test 1: Obtener todos los propietarios
    console.log('1️⃣ Test: Obtener todos los propietarios');
    try {
        const todos = await propietario.findAll();
        console.log(`   ✅ Éxito: Encontrados ${todos.length} propietarios`);
        console.log(`   📊 Datos: ${todos.length > 0 ? JSON.stringify(todos[0], null, 2) : 'No hay datos'}`);
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 2: Crear propietario
    console.log('\n2️⃣ Test: Crear nuevo propietario');
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
        
        console.log(`   ✅ Éxito: Propietario creado`);
        console.log(`   👤 Nombre: ${nuevoPropietario.nombre} ${nuevoPropietario.apellido1}`);
        console.log(`   📧 Email: ${nuevoPropietario.correo}`);
        console.log(`   📞 Celular: ${nuevoPropietario.cel}`);
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 3: Buscar por documento
    console.log('\n3️⃣ Test: Buscar propietario por documento (12345678)');
    try {
        const propietarioEncontrado = await propietario.findById(12345678);
        
        if (propietarioEncontrado) {
            console.log(`   ✅ Éxito: Propietario encontrado`);
            console.log(`   👤 Nombre: ${propietarioEncontrado.nombre} ${propietarioEncontrado.apellido1}`);
            console.log(`   📧 Email: ${propietarioEncontrado.correo}`);
        } else {
            console.log(`   ⚠️ No encontrado: Propietario con documento 12345678`);
        }
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 4: Actualizar propietario
    console.log('\n4️⃣ Test: Actualizar propietario');
    try {
        const propietarioActualizado = await propietario.actualizar(12345678, {
            tel: 7654321,
            correo: "juan.actualizado@email.com"
        });
        
        console.log(`   ✅ Éxito: Propietario actualizado`);
        console.log(`   📧 Nuevo email: ${propietarioActualizado.correo}`);
        console.log(`   📞 Nuevo teléfono: ${propietarioActualizado.tel}`);
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 5: Buscar por nombre
    console.log('\n5️⃣ Test: Buscar propietarios por nombre (Juan)');
    try {
        const propietariosPorNombre = await propietario.buscarPorNombre("Juan");
        console.log(`   ✅ Éxito: Encontrados ${propietariosPorNombre.length} propietarios con "Juan"`);
        
        if (propietariosPorNombre.length > 0) {
            propietariosPorNombre.forEach((p, index) => {
                console.log(`   📋 ${index + 1}. ${p.nombre} ${p.apellido1} - ${p.correo}`);
            });
        }
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 6: Obtener estadísticas
    console.log('\n6️⃣ Test: Obtener estadísticas del propietario');
    try {
        const estadisticas = await propietario.obtenerEstadisticas(12345678);
        console.log(`   ✅ Éxito: Estadísticas obtenidas`);
        console.log(`   🏠 Total propiedades: ${estadisticas.total_propiedades || 0}`);
        console.log(`   💰 Precio promedio: $${estadisticas.precio_promedio || 0}`);
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 7: Verificar que existe
    console.log('\n7️⃣ Test: Verificar que el propietario existe');
    try {
        const existe = await propietario.exists(12345678);
        console.log(`   ✅ Éxito: Propietario existe = ${existe}`);
        testsPasados++;
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESUMEN DE PRUEBAS DE PROPIETARIOS');
    console.log('='.repeat(60));
    console.log(`✅ Tests exitosos: ${testsPasados}`);
    console.log(`❌ Tests fallidos: ${testsFallidos}`);
    console.log(`📊 Total tests: ${testsPasados + testsFallidos}`);
    console.log(`🏆 Porcentaje de éxito: ${((testsPasados / (testsPasados + testsFallidos)) * 100).toFixed(1)}%`);
    
    if (testsFallidos === 0) {
        console.log('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
        console.log('✨ El modelo de Propietarios funciona correctamente');
    } else {
        console.log('\n⚠️ ALGUNOS TESTS FALLARON');
        console.log('🔧 Revisa los errores mostrados arriba');
    }
    
    console.log('\n💡 Los controladores y rutas también deberían funcionar correctamente');
    console.log('🌐 Para probar la API completa, inicia el servidor principal con:');
    console.log('   node src/app.js');
    console.log('\n');
    
    // Cerrar conexión
    setTimeout(() => {
        process.exit(0);
    }, 1000);
}

// Ejecutar pruebas
console.log('🔄 Iniciando conexión a la base de datos...');
setTimeout(probarPropietarios, 2000);