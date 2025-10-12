const database = require('./src/config/database');

async function configurarUsuarios() {
    try {
        console.log('🔄 Configurando tabla usuarios...');
        
        // 1. Crear la tabla usuarios
        console.log('📋 Creando tabla usuarios...');
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS usuarios (
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
        
        // 2. Insertar usuario administrador (password: admin123)
        console.log('👤 Insertando usuario administrador...');
        const insertAdminQuery = `
            INSERT IGNORE INTO usuarios (documento, nombre_usuario, password, rol) 
            VALUES ('admin', 'admin', '$2b$10$K8Xl8ZQhrzzCdVSF2mZhKeqF3L4c5cJKG4cL.W0OSr2x7YgI.LJ2S', 'admin')
        `;
        
        await database.query(insertAdminQuery);
        console.log('✅ Usuario admin creado');
        
        // 3. Insertar usuarios de prueba (password: 123456)
        console.log('👥 Insertando usuarios de prueba...');
        const insertUsersQuery = `
            INSERT IGNORE INTO usuarios (documento, nombre_usuario, password, rol) VALUES 
            ('1036941942', 'cristian.parra', '$2b$10$E4v6J6vP3Vz4C9EqKX8KSuqQmj8Qv7yQeF2xGh5L.Y9pNs1kI2mRO', 'vendedor'),
            ('12345678', 'juan.perez', '$2b$10$E4v6J6vP3Vz4C9EqKX8KSuqQmj8Qv7yQeF2xGh5L.Y9pNs1kI2mRO', 'propietario')
        `;
        
        await database.query(insertUsersQuery);
        console.log('✅ Usuarios de prueba creados');
        
        // 4. Verificar estructura de la tabla
        console.log('\n📊 Estructura de la tabla usuarios:');
        const structure = await database.query('DESCRIBE usuarios');
        console.table(structure);
        
        // 5. Verificar usuarios creados
        console.log('\n👥 Usuarios en la base de datos:');
        const usuarios = await database.query(
            'SELECT id, documento, nombre_usuario, rol, fecha_creacion, activo FROM usuarios'
        );
        console.table(usuarios);
        
        console.log('\n🎉 Configuración de usuarios completada exitosamente!');
        console.log('\n🔐 Credenciales por defecto:');
        console.log('   🔧 Admin:      admin / admin123');
        console.log('   💼 Vendedor:   cristian.parra / 123456');
        console.log('   🏠 Propietario: juan.perez / 123456');
        
        console.log('\n✅ Ahora puedes continuar con la implementación del modelo Usuario');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('📋 Stack:', error.stack);
    } finally {
        await database.close();
        process.exit(0);
    }
}

configurarUsuarios();