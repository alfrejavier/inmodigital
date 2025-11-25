-- Script para ejecutar manualmente en MySQL Workbench o phpMyAdmin
-- Copia y pega este contenido en tu herramienta MySQL

USE inmodigital;

-- =====================================================
-- Tabla de Productos
-- =====================================================

CREATE TABLE IF NOT EXISTS productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(100),
    precio DECIMAL(15, 2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    stock_minimo INT DEFAULT 5,
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    codigo_producto VARCHAR(50) UNIQUE,
    codigo_barras VARCHAR(50),
    estado ENUM('activo', 'inactivo', 'agotado', 'descontinuado') DEFAULT 'activo',
    disponible BOOLEAN DEFAULT TRUE,
    peso DECIMAL(10, 2) COMMENT 'Peso en kg',
    dimensiones VARCHAR(100) COMMENT 'Alto x Ancho x Largo en cm',
    color VARCHAR(50),
    talla VARCHAR(20),
    imagen_principal VARCHAR(255),
    imagenes_adicionales JSON COMMENT 'Array de URLs de imágenes adicionales',
    proveedor VARCHAR(100),
    costo_compra DECIMAL(15, 2) COMMENT 'Precio de compra para cálculo de margen',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_registro VARCHAR(50),
    INDEX idx_nombre (nombre),
    INDEX idx_categoria (categoria),
    INDEX idx_marca (marca),
    INDEX idx_estado (estado),
    INDEX idx_codigo (codigo_producto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE productos COMMENT = 'Tabla para gestión de productos en venta';

-- Datos de ejemplo (opcional)
INSERT INTO productos (nombre, descripcion, marca, precio, cantidad, categoria, subcategoria, codigo_producto, estado) VALUES
('Laptop Dell XPS 15', 'Laptop de alto rendimiento con procesador Intel i7, 16GB RAM, 512GB SSD', 'Dell', 3500000.00, 10, 'Tecnología', 'Computadoras', 'TEC-0001', 'activo'),
('Mouse Logitech MX Master 3', 'Mouse inalámbrico ergonómico profesional', 'Logitech', 350000.00, 25, 'Tecnología', 'Accesorios', 'TEC-0002', 'activo'),
('Silla Ergonómica Pro', 'Silla de oficina ergonómica con soporte lumbar', 'ErgoChair', 850000.00, 15, 'Muebles', 'Oficina', 'MUE-0001', 'activo'),
('Teclado Mecánico RGB', 'Teclado mecánico retroiluminado switches azul', 'Razer', 450000.00, 8, 'Tecnología', 'Accesorios', 'TEC-0003', 'activo'),
('Monitor LG 27 4K', 'Monitor UHD 4K 27 pulgadas IPS', 'LG', 1200000.00, 5, 'Tecnología', 'Monitores', 'TEC-0004', 'activo');

SELECT 'Tabla productos creada exitosamente!' as mensaje;
SELECT COUNT(*) as total_productos FROM productos;
