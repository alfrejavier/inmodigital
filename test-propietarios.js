// Prueba rápida de propietarios
const http = require('http');

function hacerPeticion(url, metodo = 'GET', datos = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        
        const opciones = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: metodo,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(opciones, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const respuesta = JSON.parse(data);
                    resolve({ status: res.statusCode, data: respuesta });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (datos) {
            req.write(JSON.stringify(datos));
        }
        
        req.end();
    });
}

async function probarPropietarios() {
    console.log('🧪 Probando endpoints de Propietarios...\n');
    
    try {
        // 1. Verificar servidor
        console.log('1. Verificando servidor...');
        const health = await hacerPeticion('http://localhost:3000/api/health');
        console.log(`Status: ${health.status} - BD: ${health.data.database}\n`);
        
        // 2. Obtener todos los propietarios (debería estar vacío)
        console.log('2. Obteniendo todos los propietarios...');
        const todosLosPropietarios = await hacerPeticion('http://localhost:3000/api/propietarios');
        console.log(`Status: ${todosLosPropietarios.status}`);
        console.log(`Total: ${todosLosPropietarios.data.total || 0}`);
        console.log(`Datos:`, todosLosPropietarios.data.data || []);
        console.log('');
        
        // 3. Crear un nuevo propietario
        console.log('3. Creando nuevo propietario...');
        const nuevoPropietario = {
            documento: 12345678,
            nombre: "Juan Carlos",
            apellido1: "Pérez",
            apellido2: "González",
            tel: 1234567,
            cel: "3001234567",
            correo: "juan.perez@email.com"
        };
        
        const propietarioCreado = await hacerPeticion('http://localhost:3000/api/propietarios', 'POST', nuevoPropietario);
        console.log(`Status: ${propietarioCreado.status}`);
        console.log(`Mensaje: ${propietarioCreado.data.message || 'Sin mensaje'}`);
        
        if (propietarioCreado.data.data) {
            console.log(`Propietario creado: ${propietarioCreado.data.data.nombre} ${propietarioCreado.data.data.apellido1}`);
        }
        console.log('');
        
        // 4. Obtener propietario por documento
        console.log('4. Obteniendo propietario por documento...');
        const propietarioPorDoc = await hacerPeticion('http://localhost:3000/api/propietarios/12345678');
        console.log(`Status: ${propietarioPorDoc.status}`);
        if (propietarioPorDoc.data.data) {
            console.log(`Encontrado: ${propietarioPorDoc.data.data.nombre} ${propietarioPorDoc.data.data.apellido1}`);
            console.log(`Email: ${propietarioPorDoc.data.data.correo}`);
        }
        console.log('');
        
        // 5. Actualizar propietario
        console.log('5. Actualizando propietario...');
        const actualizacion = {
            tel: 7654321,
            correo: "juan.actualizado@email.com"
        };
        
        const propietarioActualizado = await hacerPeticion('http://localhost:3000/api/propietarios/12345678', 'PUT', actualizacion);
        console.log(`Status: ${propietarioActualizado.status}`);
        console.log(`Mensaje: ${propietarioActualizado.data.message || 'Sin mensaje'}`);
        console.log('');
        
        // 6. Verificar actualización
        console.log('6. Verificando actualización...');
        const verificacion = await hacerPeticion('http://localhost:3000/api/propietarios/12345678');
        if (verificacion.data.data) {
            console.log(`Email actualizado: ${verificacion.data.data.correo}`);
            console.log(`Teléfono actualizado: ${verificacion.data.data.tel}`);
        }
        console.log('');
        
        // 7. Obtener estadísticas
        console.log('7. Obteniendo estadísticas...');
        const estadisticas = await hacerPeticion('http://localhost:3000/api/propietarios/12345678/estadisticas');
        console.log(`Status: ${estadisticas.status}`);
        if (estadisticas.data.data) {
            console.log(`Propiedades totales: ${estadisticas.data.data.total_propiedades || 0}`);
        }
        console.log('');
        
        console.log('🎉 ¡Todas las pruebas de propietarios completadas exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

// Ejecutar pruebas después de 2 segundos para dar tiempo al servidor
setTimeout(probarPropietarios, 2000);