/**
 * Script para actualizar registros existentes con fecha_registro
 */
const database = require('./src/config/database');

async function updateExistingClientes() {
    try {
        console.log('🔧 Actualizando registros existentes con fecha_registro...');
        
        // Actualizar registros que tienen fecha_registro NULL
        const updateQuery = `
            UPDATE clientes 
            SET fecha_registro = NOW() 
            WHERE fecha_registro IS NULL
        `;
        
        const result = await database.query(updateQuery);
        console.log(`✅ ${result.affectedRows} registros actualizados con fecha actual`);
        
        // Mostrar los clientes actualizados
        const clientesQuery = `
            SELECT documento, nombre, apellido, fecha_registro 
            FROM clientes 
            ORDER BY fecha_registro DESC
        `;
        
        const clientes = await database.query(clientesQuery);
        console.log('📋 Clientes en la base de datos:');
        clientes.forEach(cliente => {
            console.log(`- ${cliente.documento}: ${cliente.nombre} ${cliente.apellido || ''} (Registrado: ${cliente.fecha_registro})`);
        });
        
    } catch (error) {
        console.error('❌ Error al actualizar registros:', error);
        throw error;
    }
}

updateExistingClientes()
    .then(() => {
        console.log('🎉 Actualización completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Error:', error);
        process.exit(1);
    });