const database = require('./src/config/database');

async function verificar() {
    const stats = await database.query(`
        SELECT p.id, p.tipo_propiedad, p.ciudad, COUNT(c.idc) as total 
        FROM propiedades p 
        LEFT JOIN caracteristicas c ON p.id = c.propiedades_id 
        GROUP BY p.id
    `);
    
    console.log('📊 Características por propiedad:');
    console.table(stats);
    
    const ejemplos = await database.query(`
        SELECT p.tipo_propiedad, c.nombre, c.cantidad, c.detalle 
        FROM caracteristicas c 
        JOIN propiedades p ON c.propiedades_id = p.id 
        LIMIT 10
    `);
    
    console.log('\n📋 Ejemplos de características:');
    console.table(ejemplos);
    
    process.exit(0);
}

verificar();
