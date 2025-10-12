-- Crear tabla usuarios para autenticación y autorización
CREATE TABLE IF NOT EXISTS usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    documento VARCHAR(20) NOT NULL UNIQUE,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'vendedor', 'propietario') NOT NULL DEFAULT 'vendedor',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login TIMESTAMP NULL,
    
    -- Índices para mejorar rendimiento
    INDEX idx_documento (documento),
    INDEX idx_nombre_usuario (nombre_usuario),
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
);

-- Insertar usuario administrador por defecto (password: admin123)
INSERT INTO usuarios (documento, nombre_usuario, password, rol) VALUES 
('admin', 'admin', '$2b$10$K8Xl8ZQhrzzCdVSF2mZhKeqF3L4c5cJKG4cL.W0OSr2x7YgI.LJ2S', 'admin')
ON DUPLICATE KEY UPDATE 
password = VALUES(password);

-- Insertar algunos usuarios de prueba (password: 123456)
INSERT INTO usuarios (documento, nombre_usuario, password, rol) VALUES 
('1036941942', 'cristian.parra', '$2b$10$E4v6J6vP3Vz4C9EqKX8KSuqQmj8Qv7yQeF2xGh5L.Y9pNs1kI2mRO', 'vendedor'),
('12345678', 'juan.perez', '$2b$10$E4v6J6vP3Vz4C9EqKX8KSuqQmj8Qv7yQeF2xGh5L.Y9pNs1kI2mRO', 'propietario')
ON DUPLICATE KEY UPDATE 
nombre_usuario = VALUES(nombre_usuario);

-- Mostrar estructura de la tabla
DESCRIBE usuarios;