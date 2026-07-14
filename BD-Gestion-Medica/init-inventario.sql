-- Catálogo maestro de stock físico disponible en las bodegas
CREATE TABLE IF NOT EXISTS stock (
insumo_id SERIAL PRIMARY KEY,
nombre_insumo VARCHAR(100) NOT NULL,
cantidad_disponible INT NOT NULL
);
-- Tabla para salvaguardar el material comprometido temporalmente
CREATE TABLE IF NOT EXISTS reservas (
id SERIAL PRIMARY KEY,
pedido_id INT NOT NULL, -- ID del pedido que viene desde la BD de Pedidos
nombre_insumo VARCHAR(100) NOT NULL, -- Nombre del insumo clínico mapeado
cantidad_reservada INT NOT NULL,
estado VARCHAR(50) DEFAULT 'RESERVADO', -- RESERVADO, CANCELADO
fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

INSERT INTO stock (nombre_insumo, cantidad_disponible) VALUES
('Tanque de Oxigeno 10L', 50),
('Mascarilla Quirurgica KN95', 500),
('Jeringa Desechable 5ml', 1000),
('Guantes de Procedimiento Nitrilo', 800),
('Suero Fisiologico 0.9% 500ml', 300),
('Aposito Esteril 10x10cm', 250),
('Cateter Intravenoso 18G', 150),
('Alcohol Gel 1L', 60);

INSERT INTO reservas (pedido_id, nombre_insumo, cantidad_reservada, estado) VALUES
(1024, 'Tanque de Oxigeno 10L', 2, 'RESERVADO'),
(1024, 'Jeringa Desechable 5ml', 15, 'RESERVADO'),
(1025, 'Guantes de Procedimiento Nitrilo', 50, 'RESERVADO'),
(1026, 'Suero Fisiologico 0.9% 500ml', 10, 'PROCESADO'); -- PROCESADO significa que ya se despacho de bodega