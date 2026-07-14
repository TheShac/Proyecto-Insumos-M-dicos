-- Tabla principal: Cabecera del pedido
CREATE TABLE IF NOT EXISTS pedidos (
id SERIAL PRIMARY KEY,
nombre_enfermero VARCHAR(100) NOT NULL,
estado VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, COMPLETADO, RECHAZADO
fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
pabellon VARCHAR(100) NOT NULL
);
-- Tabla de detalle: Desglose multimaterial por solicitud
CREATE TABLE IF NOT EXISTS linea_pedidos (
pedido_id INT NOT NULL, -- Relación con la tabla 'pedidos' principal
insumo_id INT NOT NULL, -- ID del insumo (proveniente del catálogo maestro)
cantidad INT NOT NULL, -- Cantidad solicitada de este insumo específico
PRIMARY KEY (pedido_id, insumo_id), -- Evita insumos duplicados en el mismo pedido
FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);

INSERT INTO pedidos (nombre_enfermero, estado, pabellon) VALUES
('Brayan Silva', 'PENDIENTE', 'Pabellon Cirugia Mayor A'),
('Constanza Perez', 'COMPLETADO', 'Pabellon Urgencias Trauma'),
('Carlos Mendoza', 'PENDIENTE', 'Pabellon Maternidad B'),
('Elena Rostova', 'RECHAZADO', 'Pabellon Cardiologia');

-- Detalle para el Pedido 1 (Brayan Silva - PENDIENTE) - ¡Un solo pedido con múltiples insumos!
INSERT INTO linea_pedidos (pedido_id, insumo_id, cantidad) VALUES
(1, 1, 2),   -- 2 Tanques de Oxigeno
(1, 2, 20),  -- 20 Mascarillas KN95
(1, 3, 50);  -- 50 Jeringas Desechables

-- Detalle para el Pedido 2 (Constanza Perez - COMPLETADO)
INSERT INTO linea_pedidos (pedido_id, insumo_id, cantidad) VALUES
(2, 4, 100), -- 100 Guantes de Nitrilo
(2, 5, 10);  -- 10 Sueros Fisiológicos

-- Detalle para el Pedido 3 (Carlos Mendoza - PENDIENTE)
INSERT INTO linea_pedidos (pedido_id, insumo_id, cantidad) VALUES
(3, 6, 30),  -- 30 Apósitos Estériles
(3, 7, 15);  -- 15 Catéteres Intravenosos

-- Detalle para el Pedido 4 (Elena Rostova - RECHAZADO)
INSERT INTO linea_pedidos (pedido_id, insumo_id, cantidad) VALUES
(4, 1, 1);   -- 1 Tanque de Oxigeno (Rechazado, por ende estas líneas no generarán reservas definitivas)