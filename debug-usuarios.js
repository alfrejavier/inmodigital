const database = require('./src/config/database');

async function verificarUsuarios() {
    try {
        console.log('🔍 Verificando usuarios en la base de datos...\n');
        
        // Mostrar todos los usuarios
        const usuarios = await database.query('SELECT * FROM usuarios');
        console.log('👥 Usuarios en la base de datos:');
        console.table(usuarios);
        
        // Verificar específicamente el usuario admin
        const admin = await database.query("SELECT * FROM usuarios WHERE nombre_usuario = 'admin'");
        console.log('\n🔧 Usuario admin específico:');
        console.table(admin);
        
        if (admin.length > 0) {
            console.log(`\n📋 Hash de contraseña del admin: ${admin[0].password}`);
            console.log(`📋 Activo: ${admin[0].activo}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await database.close();
        process.exit(0);
    }
}

verificarUsuarios();