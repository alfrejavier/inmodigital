const database = require('./src/config/database');
const bcrypt = require('bcrypt');

async function actualizarPasswords() {
    try {
        console.log('🔧 Regenerando passwords correctos...\n');
        
        // Generar nuevos hashes
        const hashAdmin = await bcrypt.hash('admin123', 10);
        const hash123456 = await bcrypt.hash('123456', 10);
        
        console.log('📋 Nuevos hashes generados:');
        console.log(`   admin123: ${hashAdmin}`);
        console.log(`   123456: ${hash123456}`);
        
        // Actualizar admin
        console.log('\n🔄 Actualizando usuario admin...');
        await database.query(
            "UPDATE usuarios SET password = ? WHERE nombre_usuario = 'admin'",
            [hashAdmin]
        );
        console.log('   ✅ Admin actualizado');
        
        // Actualizar otros usuarios
        console.log('\n🔄 Actualizando otros usuarios...');
        await database.query(
            "UPDATE usuarios SET password = ? WHERE nombre_usuario IN ('cristian.parra', 'juan.perez')",
            [hash123456]
        );
        console.log('   ✅ Otros usuarios actualizados');
        
        // Verificar actualizaciones
        console.log('\n👥 Verificando usuarios actualizados:');
        const usuarios = await database.query(
            'SELECT documento, nombre_usuario, rol, activo FROM usuarios'
        );
        console.table(usuarios);
        
        // Probar logins
        console.log('\n🧪 Probando logins:');
        
        // Test admin
        const testAdmin = await bcrypt.compare('admin123', hashAdmin);
        console.log(`   Admin (admin123): ${testAdmin ? '✅ OK' : '❌ Error'}`);
        
        // Test vendedor
        const test123456 = await bcrypt.compare('123456', hash123456);
        console.log(`   Otros (123456): ${test123456 ? '✅ OK' : '❌ Error'}`);
        
        console.log('\n🎉 ¡Passwords actualizados correctamente!');
        console.log('\n🔐 Credenciales actualizadas:');
        console.log('   🔧 admin / admin123');
        console.log('   💼 cristian.parra / 123456');
        console.log('   🏠 juan.perez / 123456');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📋 Stack:', error.stack);
    } finally {
        await database.close();
        process.exit(0);
    }
}

actualizarPasswords();