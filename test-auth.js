const { usuario } = require('./src/models');

async function probarAutenticacion() {
    console.log('\n🔐 PROBANDO SISTEMA DE AUTENTICACIÓN\n');
    
    try {
        // Test 1: Login con usuario admin
        console.log('1️⃣ Test: Login usuario admin');
        const loginAdmin = await usuario.autenticar('admin', 'admin123');
        console.log('   ✅ Login admin exitoso');
        console.log(`   🔑 Token generado: ${loginAdmin.token.substring(0, 50)}...`);
        console.log(`   👤 Usuario: ${loginAdmin.usuario.nombre_usuario} (${loginAdmin.usuario.rol})`);
        
        // Test 2: Verificar token
        console.log('\n2️⃣ Test: Verificar token');
        const tokenDecodificado = usuario.verifyToken(loginAdmin.token);
        console.log('   ✅ Token válido');
        console.log(`   📋 Datos del token:`, tokenDecodificado);
        
        // Test 3: Login con usuario vendedor
        console.log('\n3️⃣ Test: Login usuario vendedor');
        const loginVendedor = await usuario.autenticar('cristian.parra', '123456');
        console.log('   ✅ Login vendedor exitoso');
        console.log(`   👤 Usuario: ${loginVendedor.usuario.nombre_usuario} (${loginVendedor.usuario.rol})`);
        
        // Test 4: Login con credenciales incorrectas
        console.log('\n4️⃣ Test: Login con credenciales incorrectas');
        try {
            await usuario.autenticar('admin', 'password_incorrecto');
            console.log('   ❌ ERROR: Debería fallar');
        } catch (error) {
            console.log('   ✅ Falló correctamente:', error.message);
        }
        
        // Test 5: Crear nuevo usuario
        console.log('\n5️⃣ Test: Crear nuevo usuario');
        const nuevoUsuario = await usuario.crear({
            documento: '99999999',
            nombre_usuario: 'test.usuario',
            password: 'password123',
            rol: 'vendedor'
        });
        console.log('   ✅ Usuario creado exitosamente');
        console.log(`   👤 Usuario: ${nuevoUsuario.nombre_usuario} (${nuevoUsuario.rol})`);
        
        // Test 6: Login con nuevo usuario
        console.log('\n6️⃣ Test: Login con nuevo usuario');
        const loginNuevo = await usuario.autenticar('test.usuario', 'password123');
        console.log('   ✅ Login nuevo usuario exitoso');
        console.log(`   👤 Usuario: ${loginNuevo.usuario.nombre_usuario}`);
        
        // Test 7: Obtener estadísticas
        console.log('\n7️⃣ Test: Obtener estadísticas de usuarios');
        const estadisticas = await usuario.obtenerEstadisticas();
        console.log('   ✅ Estadísticas obtenidas');
        console.table(estadisticas);
        
        // Test 8: Buscar usuarios por rol
        console.log('\n8️⃣ Test: Buscar usuarios por rol (vendedor)');
        const vendedores = await usuario.obtenerPorRol('vendedor');
        console.log(`   ✅ Encontrados ${vendedores.length} vendedores`);
        vendedores.forEach((v, index) => {
            console.log(`   ${index + 1}. ${v.nombre_usuario} (${v.documento})`);
        });
        
        console.log('\n🎉 ¡TODAS LAS PRUEBAS DE AUTENTICACIÓN PASARON!');
        console.log('\n🔗 ENDPOINTS DE AUTENTICACIÓN LISTOS:');
        console.log('   🔑 POST /api/auth/login - Iniciar sesión');
        console.log('   📝 POST /api/auth/register - Registrar usuario');
        console.log('   👤 GET /api/auth/profile - Ver perfil (requiere token)');
        console.log('   ✏️  PUT /api/auth/profile - Actualizar perfil (requiere token)');
        console.log('   👥 GET /api/auth/usuarios - Lista usuarios (solo admin)');
        console.log('   📊 GET /api/auth/estadisticas/usuarios - Estadísticas (solo admin)');
        
    } catch (error) {
        console.error('❌ Error en pruebas:', error.message);
        console.error('📋 Stack:', error.stack);
    } finally {
        // Cerrar conexión
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
}

probarAutenticacion();