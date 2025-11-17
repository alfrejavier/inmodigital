-- Creación de tabla propiedades para el sistema inmobiliario
-- Fecha: 2025-11-17
-- Descripción: Tabla principal para almacenar información de propiedades inmobiliarias

CREATE TABLE IF NOT EXISTS propiedades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_propiedad ENUM('casa', 'apartamento', 'oficina', 'local', 'lote', 'finca', 'bodega') NOT NULL,
    depto VARCHAR(50) NOT NULL COMMENT 'Departamento/Estado',
    ciudad VARCHAR(100) NOT NULL,
    ubicacion TEXT NOT NULL COMMENT 'Dirección completa o descripción de ubicación',
    tamano DECIMAL(10,2) NOT NULL COMMENT 'Tamaño en metros cuadrados',
    precio DECIMAL(15,2) NOT NULL COMMENT 'Precio en pesos colombianos',
    caracteristicas TEXT COMMENT 'Descripción general de características',
    disponibilidad ENUM('disponible', 'vendida', 'alquilada', 'reservada') NOT NULL DEFAULT 'disponible',
    estado ENUM('excelente', 'bueno', 'regular', 'necesita_reparacion') NOT NULL DEFAULT 'bueno',
    propietarios_documento VARCHAR(20) NOT NULL COMMENT 'Documento del propietario',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para optimizar consultas
    INDEX idx_tipo_propiedad (tipo_propiedad),
    INDEX idx_ciudad (ciudad),
    INDEX idx_disponibilidad (disponibilidad),
    INDEX idx_propietario (propietarios_documento),
    INDEX idx_precio (precio),
    
    -- Clave foránea para relacionar con propietarios
    FOREIGN KEY (propietarios_documento) REFERENCES propietarios(documento) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla de propiedades inmobiliarias';

-- Insertar algunas propiedades de ejemplo
INSERT INTO propiedades (
    tipo_propiedad, depto, ciudad, ubicacion, tamano, precio, 
    caracteristicas, disponibilidad, estado, propietarios_documento
) VALUES 
(
    'apartamento', 
    'Cundinamarca', 
    'Bogotá', 
    'Calle 127 # 15-45, Chapinero Norte', 
    85.50, 
    350000000, 
    'Apartamento moderno de 2 habitaciones, 2 baños, sala-comedor, cocina integral, balcón, parqueadero cubierto. Excelente vista panorámica de la ciudad.', 
    'disponible', 
    'excelente', 
    '1234567890'
),
(
    'casa', 
    'Antioquia', 
    'Medellín', 
    'Carrera 80 # 45-123, Laureles', 
    180.00, 
    480000000, 
    'Casa de 3 pisos, 4 habitaciones, 3 baños, garaje para 2 vehículos, jardín trasero, terraza. Zona residencial exclusiva.', 
    'disponible', 
    'excelente', 
    '9876543210'
),
(
    'oficina', 
    'Valle del Cauca', 
    'Cali', 
    'Avenida 6N # 23-45, Zona Rosa', 
    120.00, 
    280000000, 
    'Oficina comercial en edificio empresarial, 2do piso, recepción, 4 oficinas privadas, sala de juntas, baño privado, aire acondicionado.', 
    'disponible', 
    'bueno', 
    '5676567890'
),
(
    'local', 
    'Cundinamarca', 
    'Bogotá', 
    'Carrera 13 # 85-67, Zona Rosa', 
    60.00, 
    180000000, 
    'Local comercial a pie de calle, excelente ubicación, gran vitrina, baño, depósito. Ideal para restaurante o tienda.', 
    'alquilada', 
    'bueno', 
    '1234567890'
),
(
    'lote', 
    'Cundinamarca', 
    'Chía', 
    'Vereda La Balsa, Km 3 vía Cajicá', 
    1500.00, 
    420000000, 
    'Lote campestre con vista panorámica, servicios públicos disponibles, acceso por vía pavimentada. Ideal para casa de campo.', 
    'disponible', 
    'excelente', 
    '9876543210'
);

-- Verificar que se insertaron correctamente
SELECT 
    id,
    tipo_propiedad,
    CONCAT(ciudad, ', ', depto) as ubicacion_completa,
    CONCAT('$', FORMAT(precio, 0)) as precio_formateado,
    disponibilidad,
    estado
FROM propiedades 
ORDER BY id;