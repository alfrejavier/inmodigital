const mysql = require('mysql2/promise');

async function testClientes() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'inmobiliaria'
        });

        // Verificar estructura de la tabla
        const [structure] = await connection.execute('DESCRIBE clientes');
        console.log('Estructura de la tabla clientes:');
        console.table(structure);

        // Verificar datos existentes
        const [data] = await connection.execute('SELECT * FROM clientes LIMIT 5');
        console.log('Datos existentes:');
        console.table(data);

        await connection.end();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testClientes();