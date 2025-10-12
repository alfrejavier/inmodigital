/**
 * Script de prueba para verificar la consulta de propietarios
 */

const { propietario } = require('./src/models');

async function probarConsultaPropietarios() {
    try {
        console.log('🔄 Probando consulta de propietarios...');
        
        // Probar findAll sin condiciones
        const propietarios = await propietario.findAll({}, 'nombre ASC', 10);
        
        console.log('✅ Consulta exitosa!');
        console.log(`📊 Total de propietarios encontrados: ${propietarios.length}`);
        
        if (propietarios.length > 0) {
            console.log('\n📋 Primeros propietarios:');
            propietarios.slice(0, 3).forEach((prop, index) => {
                console.log(`${index + 1}. ${prop.nombre} ${prop.apellido1} - Doc: ${prop.documento}`);
            });
        } else {
            console.log('⚠️  No se encontraron propietarios en la base de datos');
            
            // Verificar si la tabla existe y tiene datos
            const testQuery = 'SELECT COUNT(*) as total FROM propietarios';
            const countResult = await propietario.db.query(testQuery);
            console.log(`🔍 Conteo directo en BD: ${countResult[0].total} registros`);
        }
        
    } catch (error) {
        console.error('❌ Error en la consulta:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // Cerrar conexión
        process.exit(0);
    }
}

probarConsultaPropietarios();