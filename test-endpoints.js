const http = require('http');

// Configuración del servidor
const BASE_URL = 'http://localhost:3003';

// Función para hacer peticiones HTTP
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method: method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Test Client'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(body);
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: body
                    });
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data && (method === 'POST' || method === 'PUT')) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// Función principal de pruebas
async function probarEndpoints() {
    console.log('\n🧪 INICIANDO PRUEBAS DE ENDPOINTS HTTP\n');
    
    let testsPasados = 0;
    let testsFallidos = 0;
    
    // Test 1: Verificar que el servidor está funcionando
    console.log('1️⃣ Test: Verificar servidor principal');
    try {
        const response = await makeRequest('GET', '/');
        if (response.status === 200) {
            console.log('   ✅ Éxito: Servidor respondiendo correctamente');
            console.log(`   📊 Mensaje: ${response.data.message}`);
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 2: Verificar salud de la base de datos
    console.log('\n2️⃣ Test: Verificar salud de la base de datos');
    try {
        const response = await makeRequest('GET', '/api/health');
        if (response.status === 200) {
            console.log('   ✅ Éxito: Base de datos conectada');
            console.log(`   📊 Total propietarios: ${response.data.data?.totalPropietarios || 'N/A'}`);
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 3: GET - Obtener todos los propietarios
    console.log('\n3️⃣ Test: GET /api/propietarios (Obtener todos)');
    try {
        const response = await makeRequest('GET', '/api/propietarios');
        if (response.status === 200) {
            console.log('   ✅ Éxito: Lista de propietarios obtenida');
            console.log(`   📊 Cantidad: ${response.data.datos?.length || 0} propietarios`);
            if (response.data.datos && response.data.datos.length > 0) {
                console.log(`   👤 Primer propietario: ${response.data.datos[0].nombre} ${response.data.datos[0].apellido1}`);
            }
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 4: POST - Crear nuevo propietario
    console.log('\n4️⃣ Test: POST /api/propietarios (Crear nuevo)');
    const nuevoPropietario = {
        documento: 87654321,
        nombre: "María Elena",
        apellido1: "García",
        apellido2: "López",
        tel: 1234567,
        cel: "3109876543",
        correo: "maria.garcia@email.com"
    };
    
    try {
        const response = await makeRequest('POST', '/api/propietarios', nuevoPropietario);
        if (response.status === 201) {
            console.log('   ✅ Éxito: Propietario creado');
            console.log(`   👤 Nombre: ${response.data.datos?.nombre} ${response.data.datos?.apellido1}`);
            console.log(`   📧 Email: ${response.data.datos?.correo}`);
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            console.log(`   📋 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 5: GET - Obtener propietario específico
    console.log('\n5️⃣ Test: GET /api/propietarios/87654321 (Obtener específico)');
    try {
        const response = await makeRequest('GET', '/api/propietarios/87654321');
        if (response.status === 200) {
            console.log('   ✅ Éxito: Propietario encontrado');
            console.log(`   👤 Nombre: ${response.data.datos?.nombre} ${response.data.datos?.apellido1}`);
            console.log(`   📧 Email: ${response.data.datos?.correo}`);
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 6: PUT - Actualizar propietario
    console.log('\n6️⃣ Test: PUT /api/propietarios/87654321 (Actualizar)');
    const datosActualizacion = {
        tel: 7654321,
        correo: "maria.actualizada@email.com"
    };
    
    try {
        const response = await makeRequest('PUT', '/api/propietarios/87654321', datosActualizacion);
        if (response.status === 200) {
            console.log('   ✅ Éxito: Propietario actualizado');
            console.log(`   📧 Nuevo email: ${response.data.datos?.correo}`);
            console.log(`   📞 Nuevo teléfono: ${response.data.datos?.tel}`);
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            console.log(`   📋 Respuesta: ${JSON.stringify(response.data, null, 2)}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Test 7: GET con filtro de búsqueda
    console.log('\n7️⃣ Test: GET /api/propietarios?search=María (Búsqueda)');
    try {
        const response = await makeRequest('GET', '/api/propietarios?search=María');
        if (response.status === 200) {
            console.log('   ✅ Éxito: Búsqueda completada');
            console.log(`   📊 Resultados: ${response.data.datos?.length || 0} propietarios encontrados`);
            testsPasados++;
        } else {
            console.log(`   ❌ Error: Status ${response.status}`);
            testsFallidos++;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        testsFallidos++;
    }
    
    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RESUMEN DE PRUEBAS DE ENDPOINTS');
    console.log('='.repeat(60));
    console.log(`✅ Tests exitosos: ${testsPasados}`);
    console.log(`❌ Tests fallidos: ${testsFallidos}`);
    console.log(`📊 Total tests: ${testsPasados + testsFallidos}`);
    console.log(`🏆 Porcentaje de éxito: ${((testsPasados / (testsPasados + testsFallidos)) * 100).toFixed(1)}%`);
    
    if (testsFallidos === 0) {
        console.log('\n🎉 ¡TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE!');
        console.log('✨ La API REST está lista para usar');
    } else {
        console.log('\n⚠️ ALGUNOS TESTS FALLARON');
        console.log('🔧 Revisa los errores mostrados arriba');
    }
    
    console.log('\n🌐 ENDPOINTS DISPONIBLES PARA TU PÁGINA WEB:');
    console.log(`   📋 Listar propietarios:     GET    ${BASE_URL}/api/propietarios`);
    console.log(`   🔍 Buscar propietarios:     GET    ${BASE_URL}/api/propietarios?search=nombre`);
    console.log(`   👤 Obtener propietario:     GET    ${BASE_URL}/api/propietarios/:documento`);
    console.log(`   ➕ Crear propietario:       POST   ${BASE_URL}/api/propietarios`);
    console.log(`   ✏️  Actualizar propietario:  PUT    ${BASE_URL}/api/propietarios/:documento`);
    console.log(`   🗑️  Eliminar propietario:    DELETE ${BASE_URL}/api/propietarios/:documento`);
    console.log('\n💡 También tienes endpoints para: clientes, propiedades, ventas, fotos, caracteristicas');
    console.log('\n');
}

// Ejecutar las pruebas
console.log('🔄 Esperando que el servidor esté listo...');
setTimeout(probarEndpoints, 3000);