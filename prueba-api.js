// Prueba simple de la API de búsqueda usando fetch
const fetch = require('node-fetch');

async function probarBusqueda() {
    try {
        console.log('=== Prueba de API de Búsqueda ===\n');
        
        // Probar búsqueda de María
        console.log('1. Buscando "María":');
        const response1 = await fetch('http://localhost:3000/api/clientes?search=María');
        const data1 = await response1.json();
        console.log('Respuesta:', JSON.stringify(data1, null, 2));
        
        // Probar búsqueda vacía (todos)
        console.log('\n2. Obteniendo todos los clientes (sin search):');
        const response2 = await fetch('http://localhost:3000/api/clientes');
        const data2 = await response2.json();
        console.log('Respuesta:', JSON.stringify(data2, null, 2));
        
        // Probar búsqueda que no existe
        console.log('\n3. Buscando "NoExiste":');
        const response3 = await fetch('http://localhost:3000/api/clientes?search=NoExiste');
        const data3 = await response3.json();
        console.log('Respuesta:', JSON.stringify(data3, null, 2));
        
    } catch (error) {
        console.error('Error en la prueba:', error.message);
    }
}

probarBusqueda();