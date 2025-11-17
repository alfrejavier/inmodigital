/**
 * Script para crear la tabla características en la base de datos
 * Las características permiten almacenar detalles adicionales de cada propiedad
 * como número de habitaciones, baños, garajes, etc.
 */
const database = require('./src/config/database');

async function crearTablaCaracteristicas() {
    try {
        console.log('📋 Creando tabla características...');

        const sqlCrearTabla = `
            CREATE TABLE IF NOT EXISTS caracteristicas (
                idc INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL COMMENT 'Nombre de la característica',
                cantidad INT COMMENT 'Cantidad o valor numérico',
                detalle VARCHAR(255) COMMENT 'Descripción adicional',
                propiedades_id INT NOT NULL COMMENT 'ID de la propiedad asociada',
                tipo ENUM(
                    'dimensiones',
                    'habitaciones',
                    'servicios',
                    'acabados',
                    'seguridad',
                    'comodidades',
                    'ubicacion',
                    'otros'
                ) DEFAULT 'otros' COMMENT 'Categoría de la característica',
                icono VARCHAR(50) COMMENT 'Nombre del icono para mostrar en UI',
                orden INT DEFAULT 0 COMMENT 'Orden de visualización',
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                -- Índices para optimizar consultas
                INDEX idx_propiedad (propiedades_id),
                INDEX idx_tipo (tipo),
                
                -- Clave foránea para relacionar con propiedades
                FOREIGN KEY (propiedades_id) REFERENCES propiedades(id) 
                    ON UPDATE CASCADE 
                    ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
            COMMENT='Tabla de características detalladas de propiedades'
        `;

        await database.query(sqlCrearTabla);
        console.log('✅ Tabla características creada exitosamente');

        // Insertar características de ejemplo para las propiedades existentes
        console.log('📝 Insertando características de ejemplo...');

        // Obtener IDs de propiedades existentes
        const propiedades = await database.query('SELECT id, tipo_propiedad FROM propiedades ORDER BY id');
        
        if (propiedades.length === 0) {
            console.log('⚠️ No hay propiedades registradas. No se pueden insertar características.');
            process.exit(0);
        }

        console.log(`✅ Encontradas ${propiedades.length} propiedades`);

        // Características para cada propiedad
        const caracteristicasPorPropiedad = {
            // Apartamento
            apartamento: [
                { nombre: 'Habitaciones', cantidad: 2, detalle: 'Con closet', tipo: 'habitaciones', icono: 'bed', orden: 1 },
                { nombre: 'Baños', cantidad: 2, detalle: 'Uno en suite', tipo: 'habitaciones', icono: 'bath', orden: 2 },
                { nombre: 'Parqueaderos', cantidad: 1, detalle: 'Cubierto', tipo: 'servicios', icono: 'car', orden: 3 },
                { nombre: 'Piso', cantidad: 8, detalle: 'Torre A', tipo: 'ubicacion', icono: 'building', orden: 4 },
                { nombre: 'Ascensor', cantidad: 2, detalle: 'Alta velocidad', tipo: 'comodidades', icono: 'elevator', orden: 5 },
                { nombre: 'Balcón', cantidad: 1, detalle: 'Vista panorámica', tipo: 'comodidades', icono: 'balcony', orden: 6 },
                { nombre: 'Área común', cantidad: 1, detalle: 'Gimnasio, BBQ, Piscina', tipo: 'comodidades', icono: 'gym', orden: 7 },
                { nombre: 'Gas Natural', cantidad: 1, detalle: 'Incluido', tipo: 'servicios', icono: 'fire', orden: 8 },
                { nombre: 'Vigilancia 24/7', cantidad: 1, detalle: 'Portería y cámaras', tipo: 'seguridad', icono: 'shield', orden: 9 }
            ],
            // Casa
            casa: [
                { nombre: 'Habitaciones', cantidad: 4, detalle: 'Una principal con baño', tipo: 'habitaciones', icono: 'bed', orden: 1 },
                { nombre: 'Baños', cantidad: 3, detalle: '2 completos, 1 social', tipo: 'habitaciones', icono: 'bath', orden: 2 },
                { nombre: 'Garaje', cantidad: 2, detalle: 'Cubierto para 2 vehículos', tipo: 'servicios', icono: 'car', orden: 3 },
                { nombre: 'Pisos', cantidad: 3, detalle: 'Sótano, planta baja, 2do piso', tipo: 'dimensiones', icono: 'layers', orden: 4 },
                { nombre: 'Jardín', cantidad: 50, detalle: '50 m² con árboles', tipo: 'comodidades', icono: 'tree', orden: 5 },
                { nombre: 'Terraza', cantidad: 1, detalle: 'En 3er piso', tipo: 'comodidades', icono: 'deck', orden: 6 },
                { nombre: 'Sala de estar', cantidad: 2, detalle: 'Principal y TV room', tipo: 'habitaciones', icono: 'sofa', orden: 7 },
                { nombre: 'Cocina integral', cantidad: 1, detalle: 'Con isla central', tipo: 'acabados', icono: 'kitchen', orden: 8 },
                { nombre: 'Alarma', cantidad: 1, detalle: 'Con monitoreo', tipo: 'seguridad', icono: 'alarm', orden: 9 }
            ],
            // Oficina
            oficina: [
                { nombre: 'Oficinas privadas', cantidad: 4, detalle: 'Con divisiones modulares', tipo: 'habitaciones', icono: 'door', orden: 1 },
                { nombre: 'Baños', cantidad: 2, detalle: 'Hombres y mujeres', tipo: 'habitaciones', icono: 'bath', orden: 2 },
                { nombre: 'Parqueaderos', cantidad: 3, detalle: 'Asignados', tipo: 'servicios', icono: 'car', orden: 3 },
                { nombre: 'Recepción', cantidad: 1, detalle: 'Amplia', tipo: 'habitaciones', icono: 'desk', orden: 4 },
                { nombre: 'Sala de juntas', cantidad: 1, detalle: 'Para 12 personas', tipo: 'habitaciones', icono: 'meeting', orden: 5 },
                { nombre: 'Aire acondicionado', cantidad: 1, detalle: 'Central', tipo: 'servicios', icono: 'snowflake', orden: 6 },
                { nombre: 'Fibra óptica', cantidad: 1, detalle: '200 Mbps', tipo: 'servicios', icono: 'wifi', orden: 7 },
                { nombre: 'Piso', cantidad: 2, detalle: 'Con ascensor', tipo: 'ubicacion', icono: 'building', orden: 8 }
            ],
            // Local comercial
            local: [
                { nombre: 'Vitrina', cantidad: 1, detalle: '6 metros de frente', tipo: 'otros', icono: 'window', orden: 1 },
                { nombre: 'Baño', cantidad: 1, detalle: 'Social', tipo: 'habitaciones', icono: 'bath', orden: 2 },
                { nombre: 'Depósito', cantidad: 1, detalle: '15 m²', tipo: 'otros', icono: 'box', orden: 3 },
                { nombre: 'Acceso calle', cantidad: 1, detalle: 'Directo desde acera', tipo: 'ubicacion', icono: 'door-open', orden: 4 },
                { nombre: 'Altura techo', cantidad: 3, detalle: '3.5 metros', tipo: 'dimensiones', icono: 'arrows-v', orden: 5 },
                { nombre: 'Persianas', cantidad: 1, detalle: 'Metálicas automáticas', tipo: 'seguridad', icono: 'shield', orden: 6 }
            ],
            // Lote
            lote: [
                { nombre: 'Topografía', cantidad: 1, detalle: 'Terreno plano', tipo: 'dimensiones', icono: 'mountain', orden: 1 },
                { nombre: 'Agua', cantidad: 1, detalle: 'Acueducto municipal', tipo: 'servicios', icono: 'droplet', orden: 2 },
                { nombre: 'Luz', cantidad: 1, detalle: 'Poste en límite', tipo: 'servicios', icono: 'lightbulb', orden: 3 },
                { nombre: 'Gas', cantidad: 0, detalle: 'No disponible', tipo: 'servicios', icono: 'fire', orden: 4 },
                { nombre: 'Vía acceso', cantidad: 1, detalle: 'Pavimentada 4 m ancho', tipo: 'ubicacion', icono: 'road', orden: 5 },
                { nombre: 'Cerramiento', cantidad: 0, detalle: 'Sin cercar', tipo: 'seguridad', icono: 'fence', orden: 6 },
                { nombre: 'Vista panorámica', cantidad: 1, detalle: 'Hacia montañas', tipo: 'comodidades', icono: 'eye', orden: 7 }
            ]
        };

        // Insertar características para cada propiedad
        let totalInsertadas = 0;
        
        for (const propiedad of propiedades) {
            const caracteristicas = caracteristicasPorPropiedad[propiedad.tipo_propiedad] || [];
            
            for (const caracteristica of caracteristicas) {
                const sqlInsertar = `
                    INSERT INTO caracteristicas (
                        propiedades_id, nombre, cantidad, detalle
                    ) VALUES (?, ?, ?, ?)
                `;
                
                const valores = [
                    propiedad.id,
                    caracteristica.nombre,
                    caracteristica.cantidad,
                    caracteristica.detalle
                ];

                await database.query(sqlInsertar, valores);
                totalInsertadas++;
            }
        }

        console.log(`✅ ${totalInsertadas} características insertadas exitosamente`);

        // Verificar inserción con JOIN
        const resultado = await database.query(`
            SELECT 
                p.id as propiedad_id,
                p.tipo_propiedad,
                p.ciudad,
                COUNT(c.idc) as total_caracteristicas
            FROM propiedades p
            LEFT JOIN caracteristicas c ON p.id = c.propiedades_id
            GROUP BY p.id
            ORDER BY p.id
        `);

        console.log('📊 Características por propiedad:');
        console.table(resultado);

        // Mostrar algunas características de ejemplo
        const ejemplos = await database.query(`
            SELECT 
                p.tipo_propiedad,
                p.ciudad,
                c.nombre,
                c.cantidad,
                c.detalle
            FROM caracteristicas c
            INNER JOIN propiedades p ON c.propiedades_id = p.id
            ORDER BY c.propiedades_id
            LIMIT 10
        `);

        console.log('\n📋 Ejemplos de características:');
        console.table(ejemplos);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creando tabla características:', error);
        process.exit(1);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    crearTablaCaracteristicas();
}

module.exports = { crearTablaCaracteristicas };
