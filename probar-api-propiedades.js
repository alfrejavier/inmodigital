/**
 * Script para probar los endpoints de la API de propiedades
 */

const BASE_URL = 'http://localhost:3000/api/propiedades';

async function probarEndpoints() {
    console.log('🧪 PROBANDO API DE PROPIEDADES\n');
    console.log('='.repeat(60));

    try {
        // 1. Obtener todas las propiedades
        console.log('\n📋 1. GET /api/propiedades - Obtener todas las propiedades');
        const response1 = await fetch(BASE_URL);
        const data1 = await response1.json();
        console.log(`   Status: ${response1.status}`);
        console.log(`   ✅ Propiedades obtenidas: ${data1.data?.paginacion?.total_registros || 0}`);
        if (data1.data?.propiedades?.length > 0) {
            console.log('\n   📊 Primera propiedad:');
            const primera = data1.data.propiedades[0];
            console.log(`      ID: ${primera.id}`);
            console.log(`      Tipo: ${primera.tipo_propiedad}`);
            console.log(`      Ciudad: ${primera.ciudad}`);
            console.log(`      Precio: $${primera.precio.toLocaleString()}`);
            console.log(`      Disponibilidad: ${primera.disponibilidad}`);
        }

        // 2. Obtener estadísticas
        console.log('\n' + '='.repeat(60));
        console.log('\n📊 2. GET /api/propiedades/estadisticas - Estadísticas');
        const response2 = await fetch(`${BASE_URL}/estadisticas`);
        const data2 = await response2.json();
        console.log(`   Status: ${response2.status}`);
        if (data2.success) {
            console.log(`   ✅ Total propiedades: ${data2.data.total}`);
            console.log(`   ✅ Disponibles: ${data2.data.disponibles}`);
            console.log(`   ✅ Vendidas: ${data2.data.vendidas}`);
            console.log(`   ✅ Alquiladas: ${data2.data.alquiladas}`);
        }

        // 3. Obtener una propiedad específica
        if (data1.data?.propiedades?.length > 0) {
            const idPropiedad = data1.data.propiedades[0].id;
            console.log('\n' + '='.repeat(60));
            console.log(`\n🏠 3. GET /api/propiedades/${idPropiedad} - Propiedad específica`);
            const response3 = await fetch(`${BASE_URL}/${idPropiedad}`);
            const data3 = await response3.json();
            console.log(`   Status: ${response3.status}`);
            if (data3.success) {
                console.log(`   ✅ Propiedad encontrada`);
                console.log(`   📍 Ubicación: ${data3.data.ubicacion}`);
                console.log(`   👤 Propietario: ${data3.data.propietario_nombre || 'N/A'}`);
                console.log(`   📏 Tamaño: ${data3.data.tamano} m²`);
                console.log(`   🏷️  Estado: ${data3.data.estado}`);
            }
        }

        // 4. Crear una nueva propiedad (ejemplo)
        console.log('\n' + '='.repeat(60));
        console.log('\n➕ 4. POST /api/propiedades - Crear propiedad');
        
        const nuevaPropiedad = {
            tipo_propiedad: 'apartamento',
            depto: 'Cundinamarca',
            ciudad: 'Bogotá',
            ubicacion: 'Calle 100 # 20-30, Chicó Norte',
            tamano: 95.5,
            precio: 420000000,
            caracteristicas: 'Apartamento de lujo, 3 habitaciones, 2 baños, balcón, parqueadero doble, cuarto útil',
            disponibilidad: 'disponible',
            estado: 'excelente',
            propietarios_documento: '80776' // Documento de un propietario existente
        };

        const response4 = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaPropiedad)
        });
        
        const data4 = await response4.json();
        console.log(`   Status: ${response4.status}`);
        
        if (data4.success) {
            console.log(`   ✅ Propiedad creada exitosamente`);
            console.log(`   🆔 ID: ${data4.data.id}`);
            console.log(`   📍 ${data4.data.ciudad}, ${data4.data.depto}`);
            
            // 5. Actualizar la propiedad recién creada
            const idNueva = data4.data.id;
            console.log('\n' + '='.repeat(60));
            console.log(`\n✏️  5. PUT /api/propiedades/${idNueva} - Actualizar propiedad`);
            
            const response5 = await fetch(`${BASE_URL}/${idNueva}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    precio: 450000000,
                    disponibilidad: 'reservada'
                })
            });
            
            const data5 = await response5.json();
            console.log(`   Status: ${response5.status}`);
            if (data5.success) {
                console.log(`   ✅ Propiedad actualizada`);
                console.log(`   💰 Nuevo precio: $${data5.data.precio.toLocaleString()}`);
                console.log(`   📋 Disponibilidad: ${data5.data.disponibilidad}`);
            }

            // 6. Cambiar solo la disponibilidad
            console.log('\n' + '='.repeat(60));
            console.log(`\n🔄 6. PATCH /api/propiedades/${idNueva}/disponibilidad - Cambiar estado`);
            
            const response6 = await fetch(`${BASE_URL}/${idNueva}/disponibilidad`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    disponibilidad: 'vendida'
                })
            });
            
            const data6 = await response6.json();
            console.log(`   Status: ${response6.status}`);
            if (data6.success) {
                console.log(`   ✅ ${data6.message}`);
            }

            // 7. Eliminar la propiedad de prueba
            console.log('\n' + '='.repeat(60));
            console.log(`\n🗑️  7. DELETE /api/propiedades/${idNueva} - Eliminar propiedad`);
            
            const response7 = await fetch(`${BASE_URL}/${idNueva}`, {
                method: 'DELETE'
            });
            
            const data7 = await response7.json();
            console.log(`   Status: ${response7.status}`);
            if (data7.success) {
                console.log(`   ✅ ${data7.message}`);
            }
        } else {
            console.log(`   ❌ Error: ${data4.message}`);
            if (data4.errores) {
                console.log('   Errores de validación:');
                data4.errores.forEach(err => console.log(`      - ${err}`));
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ PRUEBAS COMPLETADAS\n');

    } catch (error) {
        console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
    }
}

// Ejecutar pruebas
probarEndpoints();
