# Testing API Endpoints - Sistema Inmobiliario

Este archivo contiene ejemplos de cómo probar todos los endpoints de la API usando PowerShell con `Invoke-RestMethod`.

**IMPORTANTE:** Asegúrate de que el servidor esté ejecutándose en `http://localhost:3000` antes de ejecutar estos comandos.

## Variables de configuración
```powershell
$baseUrl = "http://localhost:3000/api"
$headers = @{"Content-Type" = "application/json"}
```

## 1. Endpoints de Propietarios

### Obtener todos los propietarios
```powershell
Invoke-RestMethod -Uri "$baseUrl/propietarios" -Method Get
```

### Obtener propietarios con paginación
```powershell
Invoke-RestMethod -Uri "$baseUrl/propietarios?page=1&limit=5" -Method Get
```

### Crear un nuevo propietario
```powershell
$propietario = @{
    documento = 12345678
    nombre = "Juan"
    apellido1 = "Pérez"
    apellido2 = "González"
    tel = 1234567
    cel = "3001234567"
    correo = "juan.perez@email.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/propietarios" -Method Post -Body $propietario -Headers $headers
```

### Obtener propietario por documento
```powershell
Invoke-RestMethod -Uri "$baseUrl/propietarios/12345678" -Method Get
```

### Actualizar propietario
```powershell
$actualizacion = @{
    tel = 7654321
    correo = "juan.nuevo@email.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/propietarios/12345678" -Method Put -Body $actualizacion -Headers $headers
```

### Obtener estadísticas de propietario
```powershell
Invoke-RestMethod -Uri "$baseUrl/propietarios/12345678/estadisticas" -Method Get
```

## 2. Endpoints de Clientes

### Crear un nuevo cliente
```powershell
$cliente = @{
    documento = 87654321
    nombre = "María"
    apellido = "Rodríguez"
    cel = "3009876543"
    correo = "maria.rodriguez@email.com"
    direccion = "Calle 123 #45-67"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/clientes" -Method Post -Body $cliente -Headers $headers
```

### Obtener todos los clientes
```powershell
Invoke-RestMethod -Uri "$baseUrl/clientes" -Method Get
```

### Obtener clientes interesados
```powershell
Invoke-RestMethod -Uri "$baseUrl/clientes/interesados" -Method Get
```

## 3. Endpoints de Propiedades

### Crear una nueva propiedad
```powershell
$propiedad = @{
    tipo_propiedad = "Casa"
    depto = "Antioquia"
    ciudad = "Medellín"
    ubicacion = "El Poblado"
    tamano = "150m2"
    precio = 350000000
    caracteristicas = "Casa de 3 habitaciones, 2 baños, garaje"
    disponibilidad = "disponible"
    propietarios_documento = 12345678
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/propiedades" -Method Post -Body $propiedad -Headers $headers
```

### Obtener todas las propiedades
```powershell
Invoke-RestMethod -Uri "$baseUrl/propiedades" -Method Get
```

### Obtener propiedades disponibles
```powershell
Invoke-RestMethod -Uri "$baseUrl/propiedades/disponibles" -Method Get
```

### Búsqueda avanzada de propiedades
```powershell
$filtros = @{
    tipo_propiedad = "Casa"
    depto = "Antioquia"
    precio_min = 200000000
    precio_max = 500000000
    disponibilidad = "disponible"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/propiedades/buscar" -Method Post -Body $filtros -Headers $headers
```

### Cambiar disponibilidad de propiedad
```powershell
$disponibilidad = @{
    disponibilidad = "reservada"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/propiedades/1/disponibilidad" -Method Patch -Body $disponibilidad -Headers $headers
```

## 4. Endpoints de Ventas

### Crear una nueva venta
```powershell
$venta = @{
    propiedades_id = 1
    clientes_documento = 87654321
    fecha = "2025-10-12"
    valorventa = 350000000
    estado = "pendiente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/ventas" -Method Post -Body $venta -Headers $headers
```

### Obtener todas las ventas
```powershell
Invoke-RestMethod -Uri "$baseUrl/ventas" -Method Get
```

### Obtener dashboard de ventas
```powershell
Invoke-RestMethod -Uri "$baseUrl/ventas/dashboard" -Method Get
```

### Obtener ventas por estado
```powershell
Invoke-RestMethod -Uri "$baseUrl/ventas/estado/pendiente" -Method Get
```

### Cambiar estado de venta
```powershell
$estado = @{
    estado = "completada"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/ventas/1/estado" -Method Patch -Body $estado -Headers $headers
```

## 5. Endpoints de Características

### Crear características para una propiedad
```powershell
$caracteristicas = @{
    caracteristicas = @(
        @{
            nombre = "Habitaciones"
            cantidad = 3
            detalle = "Todas con closet"
        },
        @{
            nombre = "Baños"
            cantidad = 2
            detalle = "Principal y social"
        },
        @{
            nombre = "Garaje"
            cantidad = 1
            detalle = "Cubierto"
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "$baseUrl/caracteristicas/propiedad/1/multiples" -Method Post -Body $caracteristicas -Headers $headers
```

### Obtener características de una propiedad
```powershell
Invoke-RestMethod -Uri "$baseUrl/caracteristicas/propiedad/1" -Method Get
```

### Obtener características más comunes
```powershell
Invoke-RestMethod -Uri "$baseUrl/caracteristicas/comunes?limite=5" -Method Get
```

## 6. Endpoints de Sistema

### Verificar estado del servidor
```powershell
Invoke-RestMethod -Uri "http://localhost:3000" -Method Get
```

### Verificar estado de la base de datos
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
```

## 7. Obtener Estadísticas Generales

### Estadísticas de propiedades
```powershell
Invoke-RestMethod -Uri "$baseUrl/propiedades/estadisticas" -Method Get
```

### Estadísticas de ventas
```powershell
Invoke-RestMethod -Uri "$baseUrl/ventas/estadisticas" -Method Get
```

### Reporte mensual de ventas
```powershell
Invoke-RestMethod -Uri "$baseUrl/ventas/reporte/mensual?año=2025" -Method Get
```

## 8. Manejo de Errores - Ejemplos

### Intentar obtener propietario inexistente
```powershell
try {
    Invoke-RestMethod -Uri "$baseUrl/propietarios/99999999" -Method Get
} catch {
    Write-Output "Error esperado: $($_.Exception.Message)"
}
```

### Intentar crear propietario con datos inválidos
```powershell
$propietarioInvalido = @{
    nombre = "Sin documento"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/propietarios" -Method Post -Body $propietarioInvalido -Headers $headers
} catch {
    Write-Output "Error esperado: $($_.Exception.Message)"
}
```

## Notas importantes:

1. **Orden de creación:** Crea primero propietarios, luego clientes, después propiedades, y finalmente ventas.

2. **IDs automáticos:** Los IDs de propiedades y ventas se generan automáticamente.

3. **Validaciones:** La API valida todos los datos de entrada y devuelve errores descriptivos.

4. **Relaciones:** Las propiedades deben tener un propietario válido, y las ventas deben tener una propiedad y cliente válidos.

5. **Estados:** Respeta los estados válidos para propiedades y ventas.

6. **Fotos:** Para subir fotos, necesitarás usar un cliente que soporte multipart/form-data, como Postman o una herramienta específica.