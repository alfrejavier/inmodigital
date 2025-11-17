/**
 * Script para crear la tabla propiedades en la base de datos
 * Ejecuta el SQL de creación de tabla usando la conexión de database
 */
const database = require('./src/config/database');

async function crearTablaPropiedades() {
    try {
        console.log('📋 Creando tabla propiedades...');

        const sqlCrearTabla = `
            CREATE TABLE IF NOT EXISTS propiedades (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tipo_propiedad ENUM('casa', 'apartamento', 'oficina', 'local', 'lote', 'finca', 'bodega') NOT NULL,
                depto VARCHAR(50) NOT NULL COMMENT 'Departamento/Estado',
                ciudad VARCHAR(100) NOT NULL,
                ubicacion TEXT NOT NULL COMMENT 'Dirección completa o descripción de ubicación',
                tamano DECIMAL(10,2) NOT NULL COMMENT 'Tamaño en metros cuadrados',
                precio DECIMAL(15,2) NOT NULL COMMENT 'Precio en pesos colombianos',
                caracteristicas TEXT COMMENT 'Descripción general de características',
                disponibilidad ENUM('disponible', 'vendida', 'alquilada', 'reservada') NOT NULL DEFAULT 'disponible',
                estado ENUM('excelente', 'bueno', 'regular', 'necesita_reparacion') NOT NULL DEFAULT 'bueno',
                propietarios_documento VARCHAR(20) NOT NULL COMMENT 'Documento del propietario',
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                -- Índices para optimizar consultas
                INDEX idx_tipo_propiedad (tipo_propiedad),
                INDEX idx_ciudad (ciudad),
                INDEX idx_disponibilidad (disponibilidad),
                INDEX idx_propietario (propietarios_documento),
                INDEX idx_precio (precio),
                
                -- Clave foránea para relacionar con propietarios
                FOREIGN KEY (propietarios_documento) REFERENCES propietarios(documento) 
                    ON UPDATE CASCADE 
                    ON DELETE RESTRICT
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de propiedades inmobiliarias'
        `;

        await database.query(sqlCrearTabla);
        console.log('✅ Tabla propiedades creada exitosamente');

        // Verificar propietarios existentes
        console.log('🔍 Verificando propietarios existentes...');
        const propietarios = await database.query('SELECT documento, nombre FROM propietarios ORDER BY documento');
        
        if (propietarios.length === 0) {
            console.log('⚠️ No hay propietarios registrados. No se pueden insertar propiedades con foreign key.');
            console.log('✅ Tabla propiedades creada, pero sin datos de ejemplo.');
            process.exit(0);
        }

        console.log('👥 Propietarios encontrados:');
        console.table(propietarios);

        // Insertar datos de ejemplo usando propietarios existentes
        console.log('📝 Insertando propiedades de ejemplo...');

        // Usar los primeros propietarios encontrados para los ejemplos
        const propiedadesEjemplo = [
            {
                tipo_propiedad: 'apartamento',
                depto: 'Cundinamarca',
                ciudad: 'Bogotá',
                ubicacion: 'Calle 127 # 15-45, Chapinero Norte',
                tamano: 85.50,
                precio: 350000000,
                caracteristicas: 'Apartamento moderno de 2 habitaciones, 2 baños, sala-comedor, cocina integral, balcón, parqueadero cubierto. Excelente vista panorámica de la ciudad.',
                disponibilidad: 'disponible',
                estado: 'excelente',
                propietarios_documento: propietarios[0].documento
            },
            {
                tipo_propiedad: 'casa',
                depto: 'Antioquia',
                ciudad: 'Medellín',
                ubicacion: 'Carrera 80 # 45-123, Laureles',
                tamano: 180.00,
                precio: 480000000,
                caracteristicas: 'Casa de 3 pisos, 4 habitaciones, 3 baños, garaje para 2 vehículos, jardín trasero, terraza. Zona residencial exclusiva.',
                disponibilidad: 'disponible',
                estado: 'excelente',
                propietarios_documento: propietarios[Math.min(1, propietarios.length - 1)].documento
            },
            {
                tipo_propiedad: 'oficina',
                depto: 'Valle del Cauca',
                ciudad: 'Cali',
                ubicacion: 'Avenida 6N # 23-45, Zona Rosa',
                tamano: 120.00,
                precio: 280000000,
                caracteristicas: 'Oficina comercial en edificio empresarial, 2do piso, recepción, 4 oficinas privadas, sala de juntas, baño privado, aire acondicionado.',
                disponibilidad: 'disponible',
                estado: 'bueno',
                propietarios_documento: propietarios[Math.min(2, propietarios.length - 1)].documento
            },
            {
                tipo_propiedad: 'local',
                depto: 'Cundinamarca',
                ciudad: 'Bogotá',
                ubicacion: 'Carrera 13 # 85-67, Zona Rosa',
                tamano: 60.00,
                precio: 180000000,
                caracteristicas: 'Local comercial a pie de calle, excelente ubicación, gran vitrina, baño, depósito. Ideal para restaurante o tienda.',
                disponibilidad: 'alquilada',
                estado: 'bueno',
                propietarios_documento: propietarios[0].documento
            },
            {
                tipo_propiedad: 'lote',
                depto: 'Cundinamarca',
                ciudad: 'Chía',
                ubicacion: 'Vereda La Balsa, Km 3 vía Cajicá',
                tamano: 1500.00,
                precio: 420000000,
                caracteristicas: 'Lote campestre con vista panorámica, servicios públicos disponibles, acceso por vía pavimentada. Ideal para casa de campo.',
                disponibilidad: 'disponible',
                estado: 'excelente',
                propietarios_documento: propietarios[Math.min(1, propietarios.length - 1)].documento
            }
        ];

        for (const propiedad of propiedadesEjemplo) {
            const sqlInsertar = `
                INSERT INTO propiedades (
                    tipo_propiedad, depto, ciudad, ubicacion, tamano, precio, 
                    caracteristicas, disponibilidad, estado, propietarios_documento
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const valores = [
                propiedad.tipo_propiedad,
                propiedad.depto,
                propiedad.ciudad,
                propiedad.ubicacion,
                propiedad.tamano,
                propiedad.precio,
                propiedad.caracteristicas,
                propiedad.disponibilidad,
                propiedad.estado,
                propiedad.propietarios_documento
            ];

            await database.query(sqlInsertar, valores);
        }

        console.log('✅ Propiedades de ejemplo insertadas exitosamente');

        // Verificar inserción
        const resultado = await database.query(`
            SELECT 
                id,
                tipo_propiedad,
                CONCAT(ciudad, ', ', depto) as ubicacion_completa,
                CONCAT('$', FORMAT(precio, 0)) as precio_formateado,
                disponibilidad,
                estado
            FROM propiedades 
            ORDER BY id
        `);

        console.log('📊 Propiedades creadas:');
        console.table(resultado);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creando tabla propiedades:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    crearTablaPropiedades();
}

module.exports = { crearTablaPropiedades };