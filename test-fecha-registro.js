/**
 * Test para verificar que fecha_registro funciona correctamente
 */
const fetch = require('node-fetch');

async function testFechaRegistro() {
    try {
        console.log('=== Test de fecha_registro ===\n');
        
        // 1. Crear un cliente nuevo
        const nuevoCliente = {
            documento: '999888777',
            nombre: 'Test',
            apellido: 'FechaRegistro',
            cel: '3001234567',
            correo: 'test.fecha@email.com'
        };
        
        console.log('1. Creando cliente nuevo...');
        const createResponse = await fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoCliente)
        });
        
        const createResult = await createResponse.json();
        console.log('Respuesta de creación:', createResult);
        
        if (createResult.success) {
            // 2. Obtener el cliente creado para ver la fecha_registro
            console.log('\n2. Obteniendo cliente creado...');
            const getResponse = await fetch(`http://localhost:3000/api/clientes/${nuevoCliente.documento}`);
            const getResult = await getResponse.json();
            
            console.log('Cliente obtenido:', getResult);
            
            if (getResult.success && getResult.data.fecha_registro) {
                console.log(`✅ fecha_registro creada correctamente: ${getResult.data.fecha_registro}`);
            } else {
                console.log('❌ fecha_registro no encontrada');
            }
            
            // 3. Intentar actualizar el cliente (fecha_registro NO debe cambiar)
            console.log('\n3. Actualizando cliente...');
            const updateData = {
                nombre: 'Test Actualizado',
                apellido: 'FechaRegistro Modificado'
            };
            
            const updateResponse = await fetch(`http://localhost:3000/api/clientes/${nuevoCliente.documento}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });
            
            const updateResult = await updateResponse.json();
            console.log('Respuesta de actualización:', updateResult);
            
            if (updateResult.success) {
                const fechaOriginal = getResult.data.fecha_registro;
                const fechaActualizada = updateResult.data.fecha_registro;
                
                if (fechaOriginal === fechaActualizada) {
                    console.log('✅ fecha_registro se mantuvo sin cambios en la actualización');
                } else {
                    console.log('❌ fecha_registro cambió durante la actualización');
                }
            }
        }
        
    } catch (error) {
        console.error('Error en test:', error);
    }
}

testFechaRegistro();