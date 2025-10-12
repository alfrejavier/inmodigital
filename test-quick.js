/**
 * Script de prueba rápida para probar los endpoints
 */

// Importar fetch para hacer peticiones HTTP
const https = require('http');

async function probarEndpoints() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Iniciando pruebas de endpoints...\n');
    
    try {
        // Probar endpoint principal
        console.log('1. Probando endpoint principal...');
        const response = await fetch(`${baseUrl}/`);
        const data = await response.json();
        console.log('✅ Respuesta:', data.message);
        
        // Probar health check
        console.log('\n2. Probando health check...');
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Estado BD:', healthData.database);
        
        // Probar endpoint de propietarios (debería devolver array vacío)
        console.log('\n3. Probando endpoint de propietarios...');
        const propietariosResponse = await fetch(`${baseUrl}/api/propietarios`);
        const propietariosData = await propietariosResponse.json();
        console.log('✅ Propietarios obtenidos:', propietariosData.total || 0);
        
        console.log('\n🎉 Todas las pruebas pasaron exitosamente!');
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error.message);
    }
}

// Ejecutar pruebas si el servidor está disponible
setTimeout(probarEndpoints, 2000);

console.log('Esperando que el servidor esté listo...');