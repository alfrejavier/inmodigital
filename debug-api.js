const Cliente = require('./src/models/Cliente');

async function debugAPI() {
    const cliente = new Cliente();
    
    try {
        console.log('=== DEBUG: Simulando llamada de API ===\n');
        
        // Simular el controlador
        const searchTerm = 'María';
        const limit = 50;
        
        console.log(`Parámetros: searchTerm="${searchTerm}", limit=${limit}`);
        
        let clientes;
        if (searchTerm && searchTerm.trim()) {
            console.log('Entrando a búsqueda por término...');
            clientes = await cliente.buscarPorNombre(searchTerm.trim(), parseInt(limit));
        } else {
            console.log('Entrando a obtener todos...');
            clientes = await cliente.obtenerTodos({ 
                limite: parseInt(limit), 
                pagina: 1
            });
        }
        
        console.log(`\nResultados: ${clientes.length} clientes encontrados`);
        clientes.forEach(c => {
            console.log(`- ${c.documento}: ${c.nombre} ${c.apellido || ''}`);
        });
        
        // Simular respuesta como API
        const response = {
            success: true,
            data: clientes,
            total: clientes.length,
            page: 1,
            limit: parseInt(limit)
        };
        
        console.log('\nRespuesta simulada:', JSON.stringify(response, null, 2));
        
        process.exit(0);
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugAPI();