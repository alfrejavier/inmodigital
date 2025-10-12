// Script para crear la tabla usuarios
const database = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function crearTablaUsuarios() {
    try {
        console.log('🔄 Creando tabla usuarios...');
        
        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'sql', 'create_usuarios_table.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Dividir las consultas por punto y coma
        const queries = sqlContent
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0 && !query.startsWith('--'));
        
        // Ejecutar cada consulta
        for (const query of queries) {
            if (query.toLowerCase().includes('create table')) {
                console.log('📋 Creando tabla usuarios...');
                await database.query(query);
                console.log('✅ Tabla usuarios creada exitosamente');
            } else if (query.toLowerCase().includes('insert into')) {
                console.log('👤 Insertando usuarios por defecto...');
                await database.query(query);
                console.log('✅ Usuarios por defecto creados');
            } else if (query.toLowerCase().includes('describe')) {
                console.log('📊 Estructura de la tabla usuarios:');
                const result = await database.query(query);
                console.table(result);
            }
        }
        
        // Verificar que los usuarios se crearon correctamente
        console.log('\n👥 Verificando usuarios creados:');
        const usuarios = await database.query(
            'SELECT id, documento, nombre_usuario, rol, fecha_creacion, activo FROM usuarios'
        );
        console.table(usuarios);
        
        console.log('\n🎉 Tabla usuarios configurada exitosamente!');
        console.log('🔐 Credenciales por defecto:');
        console.log('   Admin: admin / admin123');
        console.log('   Vendedor: cristian.parra / 123456');
        console.log('   Propietario: juan.perez / 123456');
        
        // Cerrar conexión
        await database.close();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

crearTablaUsuarios();