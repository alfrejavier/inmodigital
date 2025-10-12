# 🚀 GUÍA PARA PROBAR LOS ENDPOINTS

## ✅ Servidor funcionando en: http://localhost:3003

### 🏠 Página Principal
- **URL:** http://localhost:3003
- **Método:** GET
- **Descripción:** Muestra información general de la API y todos los endpoints disponibles

### 📊 Verificar Estado de la Base de Datos
- **URL:** http://localhost:3003/api/health  
- **Método:** GET
- **Descripción:** Verifica que la conexión a MySQL esté funcionando

## 👥 ENDPOINTS DE PROPIETARIOS

### 1️⃣ Obtener todos los propietarios
```
GET http://localhost:3003/api/propietarios
```

### 2️⃣ Buscar propietarios por nombre
```
GET http://localhost:3003/api/propietarios?search=Juan
```

### 3️⃣ Obtener un propietario específico
```
GET http://localhost:3003/api/propietarios/12345678
```

### 4️⃣ Crear nuevo propietario
```
POST http://localhost:3003/api/propietarios
Content-Type: application/json

{
    "documento": 98765432,
    "nombre": "Ana",
    "apellido1": "Martínez", 
    "apellido2": "Rodríguez",
    "tel": 1234567,
    "cel": "3001234567",
    "correo": "ana.martinez@email.com"
}
```

### 5️⃣ Actualizar propietario existente
```
PUT http://localhost:3003/api/propietarios/98765432
Content-Type: application/json

{
    "tel": 7654321,
    "correo": "ana.nuevo@email.com"
}
```

### 6️⃣ Eliminar propietario
```
DELETE http://localhost:3003/api/propietarios/98765432
```

## 🏢 OTROS ENDPOINTS DISPONIBLES

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear nuevo cliente
- `GET /api/clientes/:documento` - Obtener cliente específico
- `PUT /api/clientes/:documento` - Actualizar cliente
- `DELETE /api/clientes/:documento` - Eliminar cliente

### Propiedades
- `GET /api/propiedades` - Obtener todas las propiedades
- `POST /api/propiedades` - Crear nueva propiedad
- `GET /api/propiedades/:codigo` - Obtener propiedad específica
- `PUT /api/propiedades/:codigo` - Actualizar propiedad
- `DELETE /api/propiedades/:codigo` - Eliminar propiedad

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `POST /api/ventas` - Registrar nueva venta
- `GET /api/ventas/:id` - Obtener venta específica
- `PUT /api/ventas/:id` - Actualizar venta
- `DELETE /api/ventas/:id` - Eliminar venta

### Fotos de Propiedades
- `GET /api/fotos` - Obtener todas las fotos
- `POST /api/fotos` - Subir nueva foto
- `GET /api/fotos/:id` - Obtener foto específica
- `DELETE /api/fotos/:id` - Eliminar foto

### Características
- `GET /api/caracteristicas` - Obtener todas las características
- `POST /api/caracteristicas` - Crear nueva característica
- `GET /api/caracteristicas/:id` - Obtener característica específica
- `PUT /api/caracteristicas/:id` - Actualizar característica
- `DELETE /api/caracteristicas/:id` - Eliminar característica

## 🔧 HERRAMIENTAS PARA PROBAR

### 1. **Navegador Web** (Para GET requests)
- Abre http://localhost:3003/api/propietarios
- Abre http://localhost:3003/api/health

### 2. **PowerShell/CMD** (Con curl)
```powershell
# GET request
curl.exe -X GET "http://localhost:3003/api/propietarios" -H "Content-Type: application/json"

# POST request  
curl.exe -X POST "http://localhost:3003/api/propietarios" -H "Content-Type: application/json" -d "{\"documento\":98765432,\"nombre\":\"Ana\",\"apellido1\":\"Martínez\",\"correo\":\"ana@email.com\"}"
```

### 3. **Postman** (Recomendado)
- Importa las URLs y configura los métodos HTTP
- Permite crear colecciones de pruebas

### 4. **Thunder Client** (Extensión de VS Code)
- Instala la extensión Thunder Client
- Crea requests directamente en VS Code

## 📋 EJEMPLOS DE RESPUESTAS

### GET /api/propietarios
```json
{
    "success": true,
    "message": "Propietarios obtenidos exitosamente",
    "datos": [
        {
            "documento": 1036941942,
            "nombre": "Cristian", 
            "apellido1": "Parra",
            "correo": "crs@gm.c",
            "tel": "32998199",
            "cel": "23999288"
        }
    ],
    "total": 3
}
```

### POST /api/propietarios (Éxito)
```json
{
    "success": true,
    "message": "Propietario creado exitosamente", 
    "datos": {
        "documento": 98765432,
        "nombre": "Ana",
        "apellido1": "Martínez",
        "correo": "ana.martinez@email.com"
    }
}
```

### Error de validación
```json
{
    "success": false,
    "message": "Datos de entrada inválidos",
    "errores": [
        "El campo 'nombre' es requerido",
        "El email no tiene un formato válido"
    ]
}
```

## 🎯 ESTADO ACTUAL

✅ **Servidor funcionando en puerto 3003**
✅ **Base de datos conectada correctamente** 
✅ **Todos los endpoints implementados**
✅ **Validaciones funcionando**
✅ **Manejo de errores implementado**

🎉 **¡Tu API está lista para alimentar tu página web!**