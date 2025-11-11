// Test para verificar envío de datos del formulario de clientes
console.log('=== Test de Formulario de Clientes ===');

// Simular datos del formulario
const testData = {
    documento: '987654321',
    nombre: 'Ana',
    apellido: 'Martínez', 
    cel: '3101234567',
    correo: 'ana.martinez@email.com'
};

console.log('Datos de prueba:', testData);

// Test de envío a API
fetch('http://localhost:3000/api/clientes', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
    console.log('Respuesta de la API:', data);
})
.catch(error => {
    console.error('Error:', error);
});