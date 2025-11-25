# API de Productos - Documentación

## Base URL
```
http://localhost:3002/api/productos
```

## Endpoints Disponibles

### 1. Obtener todos los productos
**GET** `/api/productos`

**Parámetros de consulta (opcionales):**
- `categoria` - Filtrar por categoría
- `marca` - Filtrar por marca
- `estado` - Filtrar por estado (activo, inactivo, agotado, descontinuado)
- `search` - Búsqueda por nombre, descripción, código o marca
- `precio_min` - Precio mínimo
- `precio_max` - Precio máximo
- `disponible` - true/false
- `pagina` - Número de página (default: 1)
- `limite` - Registros por página (default: 50)

**Ejemplo:**
```bash
GET /api/productos?categoria=Tecnología&estado=activo&pagina=1&limite=20
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id_producto": 1,
        "nombre": "Laptop Dell XPS 15",
        "descripcion": "Laptop de alto rendimiento",
        "marca": "Dell",
        "precio": 3500000.00,
        "cantidad": 10,
        "stock_minimo": 5,
        "categoria": "Tecnología",
        "estado": "activo",
        "estado_stock": "stock_normal",
        "margen": 500000.00,
        "fecha_registro": "2025-11-24T10:00:00.000Z"
      }
    ],
    "paginacion": {
      "pagina_actual": 1,
      "limite": 20,
      "total_registros": 45,
      "total_paginas": 3
    }
  }
}
```

---

### 2. Obtener un producto por ID
**GET** `/api/productos/:id`

**Ejemplo:**
```bash
GET /api/productos/1
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id_producto": 1,
    "nombre": "Laptop Dell XPS 15",
    "descripcion": "Laptop de alto rendimiento",
    "marca": "Dell",
    "precio": 3500000.00,
    "cantidad": 10,
    "codigo_producto": "TEC-0001",
    "estado": "activo",
    "imagen_principal": "/images/productos/laptop-dell.jpg",
    "imagenes_adicionales": [
      "/images/productos/laptop-dell-2.jpg",
      "/images/productos/laptop-dell-3.jpg"
    ]
  }
}
```

---

### 3. Crear un nuevo producto
**POST** `/api/productos`

**Body (JSON):**
```json
{
  "nombre": "Mouse Logitech MX Master 3",
  "descripcion": "Mouse inalámbrico ergonómico profesional",
  "marca": "Logitech",
  "precio": 350000.00,
  "cantidad": 25,
  "stock_minimo": 5,
  "categoria": "Tecnología",
  "subcategoria": "Accesorios",
  "codigo_producto": "TEC-0002",
  "estado": "activo",
  "disponible": true,
  "peso": 0.142,
  "color": "Negro",
  "imagen_principal": "/images/productos/mouse-logitech.jpg",
  "proveedor": "Distribuidora Tech",
  "costo_compra": 250000.00
}
```

**Nota:** Si no se proporciona `codigo_producto`, se generará automáticamente basado en la categoría.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id_producto": 2,
    "nombre": "Mouse Logitech MX Master 3",
    "precio": 350000.00,
    ...
  },
  "message": "Producto creado exitosamente"
}
```

---

### 4. Actualizar un producto
**PUT** `/api/productos/:id`

**Body (JSON):**
```json
{
  "precio": 320000.00,
  "cantidad": 30,
  "estado": "activo"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id_producto": 2,
    "nombre": "Mouse Logitech MX Master 3",
    "precio": 320000.00,
    "cantidad": 30,
    ...
  },
  "message": "Producto actualizado exitosamente"
}
```

---

### 5. Actualizar stock de un producto
**PATCH** `/api/productos/:id/stock`

**Body (JSON):**
```json
{
  "cantidad": 10,
  "operacion": "add"
}
```

**Operaciones disponibles:**
- `set` - Establecer cantidad exacta
- `add` - Sumar a la cantidad actual
- `subtract` - Restar de la cantidad actual

**Ejemplos:**
```json
// Establecer stock en 50 unidades
{ "cantidad": 50, "operacion": "set" }

// Agregar 20 unidades al stock actual
{ "cantidad": 20, "operacion": "add" }

// Restar 5 unidades del stock actual
{ "cantidad": 5, "operacion": "subtract" }
```

---

### 6. Eliminar un producto
**DELETE** `/api/productos/:id`

**Ejemplo:**
```bash
DELETE /api/productos/2
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

### 7. Obtener productos con stock bajo
**GET** `/api/productos/stock-bajo`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id_producto": 5,
      "nombre": "Monitor LG 27 4K",
      "cantidad": 3,
      "stock_minimo": 5,
      "faltante": 2
    }
  ],
  "total": 1
}
```

---

### 8. Obtener categorías
**GET** `/api/productos/categorias`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    "Tecnología",
    "Muebles",
    "Oficina",
    "Accesorios"
  ]
}
```

---

### 9. Obtener marcas
**GET** `/api/productos/marcas`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    "Dell",
    "Logitech",
    "LG",
    "Razer",
    "ErgoChair"
  ]
}
```

---

## Códigos de Estado HTTP

- `200` - OK (Operación exitosa)
- `201` - Created (Producto creado)
- `400` - Bad Request (Datos inválidos)
- `404` - Not Found (Producto no encontrado)
- `500` - Internal Server Error (Error del servidor)

---

## Ejemplos de uso con JavaScript (fetch)

### Obtener todos los productos
```javascript
async function obtenerProductos() {
    const response = await fetch('http://localhost:3002/api/productos');
    const data = await response.json();
    console.log(data);
}
```

### Crear un producto
```javascript
async function crearProducto() {
    const producto = {
        nombre: "Teclado Mecánico RGB",
        marca: "Razer",
        precio: 450000,
        cantidad: 15,
        categoria: "Tecnología"
    };

    const response = await fetch('http://localhost:3002/api/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
    });

    const data = await response.json();
    console.log(data);
}
```

### Actualizar stock
```javascript
async function agregarStock(id, cantidad) {
    const response = await fetch(`http://localhost:3002/api/productos/${id}/stock`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cantidad: cantidad,
            operacion: 'add'
        })
    });

    const data = await response.json();
    console.log(data);
}
```

---

## Notas Importantes

1. **Códigos de producto automáticos:** Si no proporcionas un `codigo_producto`, se generará automáticamente con el formato `CATEGORIA-0001`.

2. **Stock bajo:** Un producto se considera con stock bajo cuando `cantidad <= stock_minimo`.

3. **Estado agotado:** Cuando la cantidad llega a 0, el estado puede actualizarse automáticamente a 'agotado'.

4. **Imágenes adicionales:** El campo `imagenes_adicionales` acepta un array de URLs que se almacena como JSON.

5. **Búsqueda:** El parámetro `search` busca en nombre, descripción, código de producto y marca.

6. **Margen de ganancia:** Se calcula automáticamente como `precio - costo_compra`.
