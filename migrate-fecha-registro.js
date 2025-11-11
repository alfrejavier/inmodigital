/**
 * Script para agregar el campo fecha_registro a la tabla clientes
 */
const database = require('./src/config/database');

async function addFechaRegistroColumn() {
    try {
        console.log('🔧 Agregando columna fecha_registro a tabla clientes...');
        
        // Verificar si la columna ya existe
        const checkColumnQuery = `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'inmobiliaria' 
            AND TABLE_NAME = 'clientes' 
            AND COLUMN_NAME = 'fecha_registro'
        `;
        
        const existingColumn = await database.query(checkColumnQuery);
        
        if (existingColumn.length > 0) {
            console.log('✅ La columna fecha_registro ya existe en la tabla clientes');
            return;
        }
        
        // Agregar la columna
        const addColumnQuery = `
            ALTER TABLE clientes 
            ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP 
            COMMENT 'Fecha y hora de registro del cliente'
        `;
        
        await database.query(addColumnQuery);
        console.log('✅ Columna fecha_registro agregada exitosamente');
        
        // Actualizar registros existentes con fecha actual
        const updateExistingQuery = `
            UPDATE clientes 
            SET fecha_registro = NOW() 
            WHERE fecha_registro IS NULL
        `;
        
        const result = await database.query(updateExistingQuery);
        console.log(`✅ ${result.affectedRows} registros existentes actualizados con fecha actual`);
        
    } catch (error) {
        console.error('❌ Error al agregar columna fecha_registro:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    addFechaRegistroColumn()
        .then(() => {
            console.log('🎉 Migración completada exitosamente');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Error en la migración:', error);
            process.exit(1);
        });
}

module.exports = addFechaRegistroColumn;