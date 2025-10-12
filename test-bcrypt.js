const bcrypt = require('bcrypt');

async function probarPasswords() {
    try {
        console.log('🔐 Probando hash de passwords...\n');
        
        // Hash actual del admin desde la BD
        const hashAdmin = '$2b$10$K8Xl8ZQhrzzCdVSF2mZhKeqF3L4c5cJKG4cL.W0OSr2x7YgI.LJ2S';
        
        // Contraseñas a probar
        const passwords = ['admin123', 'admin', '123456', 'password'];
        
        for (const password of passwords) {
            console.log(`🧪 Probando contraseña: "${password}"`);
            const esValida = await bcrypt.compare(password, hashAdmin);
            console.log(`   Resultado: ${esValida ? '✅ VÁLIDA' : '❌ Inválida'}`);
        }
        
        console.log('\n🔧 Generando nuevo hash para admin123...');
        const nuevoHash = await bcrypt.hash('admin123', 10);
        console.log(`   Nuevo hash: ${nuevoHash}`);
        
        console.log('\n🧪 Probando nuevo hash...');
        const esValidoNuevo = await bcrypt.compare('admin123', nuevoHash);
        console.log(`   Resultado: ${esValidoNuevo ? '✅ VÁLIDA' : '❌ Inválida'}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

probarPasswords();