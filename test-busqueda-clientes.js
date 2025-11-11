const Cliente = require('./src/models/Cliente');

async function testBusqueda() {
    try {
        const cliente = new Cliente();
        
        console.log('=== Probando búsqueda de clientes ===');
        
        // Probar obtener todos
        console.log('\n1. Obtener todos los clientes:');
        const todos = await cliente.obtenerTodos({ limite: 50 });
        console.log('Total encontrados:', todos.length);
        todos.forEach(c => console.log(`- ${c.documento}: ${c.nombre} ${c.apellido || ''}`));
        
        // Probar búsqueda específica
        console.log('\n2. Buscar por "María":');
        const resultados = await cliente.buscarPorNombre('María');
        console.log('Resultados encontrados:', resultados.length);
        resultados.forEach(c => console.log(`- ${c.documento}: ${c.nombre} ${c.apellido || ''}`));
        
        // Probar búsqueda que no existe
        console.log('\n3. Buscar por "NoExiste":');
        const vacio = await cliente.buscarPorNombre('NoExiste');
        console.log('Resultados encontrados:', vacio.length);
        
        console.log('\n=== Pruebas completadas ===');
        process.exit(0);
        
    } catch (error) {
        console.error('Error en las pruebas:', error);
        process.exit(1);
    }
}

testBusqueda();