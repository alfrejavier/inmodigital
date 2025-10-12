const database = require('./src/config/database');

async function verificarUsuarios() {
    try {
        console.log('🔍 Verificando estado de la tabla usuarios...\n');
        
        // Verificar si la tabla existe
        try {
            const tables = await database.query("SHOW TABLES LIKE 'usuarios'");
            
            if (tables.length > 0) {
                console.log('📋 La tabla usuarios existe. Estructura actual:');
                const structure = await database.query('DESCRIBE usuarios');
                console.table(structure);
                
                console.log('\n📊 Contenido actual:');
                try {
                    const content = await database.query('SELECT * FROM usuarios LIMIT 5');
                    console.table(content);
                } catch (selectError) {
                    console.log('⚠️ Error al leer contenido:', selectError.message);
                }
                
                // Eliminar tabla existente y recrear
                console.log('\n🗑️ Eliminando tabla existente para recrearla...');
                await database.query('DROP TABLE usuarios');
                console.log('✅ Tabla eliminada');
                
            } else {
                console.log('ℹ️ La tabla usuarios no existe, la crearemos');
            }
            
            // Crear nueva tabla con estructura correcta
            console.log('\n📋 Creando nueva tabla usuarios...');
            const createTableQuery = `
                CREATE TABLE usuarios (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    documento VARCHAR(20) NOT NULL UNIQUE,
                    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    rol ENUM('admin', 'vendedor', 'propietario') NOT NULL DEFAULT 'vendedor',
                    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    activo BOOLEAN DEFAULT TRUE,
                    ultimo_login TIMESTAMP NULL,
                    
                    INDEX idx_documento (documento),
                    INDEX idx_nombre_usuario (nombre_usuario),
                    INDEX idx_rol (rol),
                    INDEX idx_activo (activo)
                )
            `;
            
            await database.query(createTableQuery);
            console.log('✅ Tabla usuarios creada exitosamente');
            
            // Verificar la nueva estructura
            console.log('\n📊 Nueva estructura:');
            const newStructure = await database.query('DESCRIBE usuarios');
            console.table(newStructure);
            
            // Insertar usuarios por defecto
            console.log('\n👤 Insertando usuarios por defecto...');
            
            // Admin (password: admin123)
            await database.query(`
                INSERT INTO usuarios (documento, nombre_usuario, password, rol) 
                VALUES ('admin', 'admin', '$2b$10$K8Xl8ZQhrzzCdVSF2mZhKeqF3L4c5cJKG4cL.W0OSr2x7YgI.LJ2S', 'admin')
            `);
            
            // Vendedor (password: 123456)
            await database.query(`
                INSERT INTO usuarios (documento, nombre_usuario, password, rol) 
                VALUES ('1036941942', 'cristian.parra', '$2b$10$E4v6J6vP3Vz4C9EqKX8KSuqQmj8Qv7yQeF2xGh5L.Y9pNs1kI2mRO', 'vendedor')
            `);
            
            // Propietario (password: 123456)
            await database.query(`
                INSERT INTO usuarios (documento, nombre_usuario, password, rol) 
                VALUES ('12345678', 'juan.perez', '$2b$10$E4v6J6vP3Vz4C9EqKX8KSuqQmj8Qv7yQeF2xGh5L.Y9pNs1kI2mRO', 'propietario')
            `);
            
            console.log('✅ Usuarios por defecto insertados');
            
            // Verificar usuarios creados
            console.log('\n👥 Usuarios en la base de datos:');
            const usuarios = await database.query(
                'SELECT id, documento, nombre_usuario, rol, fecha_creacion, activo FROM usuarios'
            );
            console.table(usuarios);
            
            console.log('\n🎉 ¡Tabla usuarios configurada correctamente!');
            console.log('\n🔐 Credenciales disponibles:');
            console.log('   🔧 Admin:      usuario: admin, password: admin123');
            console.log('   💼 Vendedor:   usuario: cristian.parra, password: 123456');
            console.log('   🏠 Propietario: usuario: juan.perez, password: 123456');
            
        } catch (error) {
            console.error('❌ Error verificando tabla:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
        console.error('📋 Stack:', error.stack);
    } finally {
        await database.close();
        process.exit(0);
    }
}

verificarUsuarios();