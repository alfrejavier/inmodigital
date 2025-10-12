# Sistema Inmobiliario - API REST

Un sistema completo de gestión inmobiliaria desarrollado con Node.js, Express y MySQL utilizando Programación Orientada a Objetos (POO).

## 📋 Características

- **Gestión de Propietarios**: CRUD completo con validaciones
- **Gestión de Clientes**: Administración de clientes y su historial
- **Gestión de Propiedades**: Catálogo de propiedades con fotos y características
- **Gestión de Ventas**: Control del proceso de ventas desde contacto hasta cierre
- **Gestión de Fotos**: Subida y administración de imágenes de propiedades
- **Gestión de Características**: Detalles específicos de cada propiedad

## 🛠️ Tecnologías Utilizadas

- **Node.js**: Runtime de JavaScript
- **Express.js**: Framework web para Node.js
- **MySQL2**: Cliente MySQL con soporte para promesas
- **POO (Programación Orientada a Objetos)**: Arquitectura del sistema
- **dotenv**: Gestión de variables de entorno
- **cors**: Middleware para habilitar CORS
- **multer**: Middleware para subida de archivos

## 📁 Estructura del Proyecto

```
inmobiliaria-app/
├── src/
│   ├── models/          # Modelos POO (BaseModel, Propietario, Cliente, etc.)
│   ├── controllers/     # Controladores de lógica de negocio
│   ├── routes/          # Definición de rutas de la API
│   ├── config/          # Configuraciones (base de datos, etc.)
│   ├── middleware/      # Middleware personalizado
│   ├── services/        # Servicios adicionales
│   └── app.js           # Aplicación principal Express
├── public/
│   └── images/
│       └── propiedades/ # Imágenes subidas de propiedades
├── .env                 # Variables de entorno
├── .gitignore          # Archivos ignorados por Git
├── package.json        # Dependencias y scripts
└── README.md           # Este archivo
```

## 🗄️ Base de Datos

El sistema utiliza la base de datos MySQL `inmobiliaria` con las siguientes tablas:

- `propietarios`: Información de los propietarios
- `clientes`: Datos de los clientes
- `propiedades`: Catálogo de propiedades
- `ventas`: Registro de transacciones
- `fotos`: Imágenes de las propiedades
- `caracteristicas`: Detalles específicos de propiedades

## 🚀 Instalación

### Prerrequisitos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio** (cuando esté disponible)
```bash
git clone <url-del-repositorio>
cd inmobiliaria-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar la base de datos**
   - Crear la base de datos en MySQL usando el script SQL proporcionado
   - Ejecutar el script `inmodigital.sql` en phpMyAdmin o cliente MySQL

4. **Configurar variables de entorno**
   - Renombrar `.env.example` a `.env` (si existe)
   - Modificar las variables en `.env`:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inmobiliaria
DB_USER=root
DB_PASSWORD=tu_password_mysql

# Configuración de archivos
UPLOAD_PATH=./public/images/propiedades/
MAX_FILE_SIZE=5242880

# URL base para las imágenes
BASE_URL=http://localhost:3000
```

5. **Iniciar la aplicación**

Para desarrollo:
```bash
npm run dev
```

Para producción:
```bash
npm start
```

## 📡 API Endpoints (Próximamente)

### Propietarios
- `GET /api/propietarios` - Obtener todos los propietarios
- `GET /api/propietarios/:documento` - Obtener propietario por documento
- `POST /api/propietarios` - Crear nuevo propietario
- `PUT /api/propietarios/:documento` - Actualizar propietario
- `DELETE /api/propietarios/:documento` - Eliminar propietario

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:documento` - Obtener cliente por documento
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:documento` - Actualizar cliente
- `DELETE /api/clientes/:documento` - Eliminar cliente

### Propiedades
- `GET /api/propiedades` - Obtener todas las propiedades
- `GET /api/propiedades/:id` - Obtener propiedad por ID
- `GET /api/propiedades/disponibles` - Obtener propiedades disponibles
- `POST /api/propiedades` - Crear nueva propiedad
- `PUT /api/propiedades/:id` - Actualizar propiedad
- `DELETE /api/propiedades/:id` - Eliminar propiedad

### Ventas
- `GET /api/ventas` - Obtener todas las ventas
- `GET /api/ventas/:id` - Obtener venta por ID
- `POST /api/ventas` - Crear nueva venta
- `PUT /api/ventas/:id` - Actualizar venta
- `DELETE /api/ventas/:id` - Eliminar venta

## 🧪 Pruebas

Para probar que todo funciona correctamente:

1. **Verificar el servidor**
```bash
# El servidor debería estar ejecutándose en http://localhost:3000
curl http://localhost:3000
```

2. **Verificar la conexión a la base de datos**
```bash
curl http://localhost:3000/api/health
```

## 📝 Modelos POO

### BaseModel
Clase base que proporciona funcionalidades CRUD comunes para todos los modelos.

### Propietario
- Gestión de propietarios de inmuebles
- Validaciones de datos
- Relación con propiedades

### Cliente
- Gestión de clientes interesados
- Historial de compras
- Estadísticas de cliente

### Propiedad
- Catálogo de inmuebles
- Estados de disponibilidad
- Relaciones con fotos y características

### Venta
- Proceso de ventas
- Estados de transacción
- Relaciones con propiedades y clientes

### Foto
- Gestión de imágenes
- Asociación con propiedades

### Caracteristica
- Detalles específicos de propiedades
- Características cuantificables

## 🔧 Desarrollo

### Scripts disponibles
- `npm start`: Inicia la aplicación en modo producción
- `npm run dev`: Inicia la aplicación con nodemon para desarrollo
- `npm test`: Ejecuta las pruebas (por implementar)

### Próximos pasos
1. Implementar controladores
2. Crear rutas de la API
3. Agregar middleware de autenticación
4. Implementar subida de archivos
5. Crear documentación de API
6. Agregar pruebas unitarias

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.

## 👥 Contribución

1. Fork el proyecto
2. Crear una rama para la característica (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📞 Soporte

Para soporte o preguntas, por favor abrir un issue en el repositorio del proyecto.