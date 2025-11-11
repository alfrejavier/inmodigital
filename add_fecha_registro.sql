-- Agregar campo fecha_registro a la tabla clientes
ALTER TABLE clientes 
ADD COLUMN fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de registro del cliente';