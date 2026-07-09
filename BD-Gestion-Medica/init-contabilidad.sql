-- Tabla catálogo espejo en Contabilidad para cálculo autónomo de costos
CREATE TABLE IF NOT EXISTS insumos (
insumo_id INT PRIMARY KEY, -- Mismo ID que viene de la BD de Inventario
nombre_insumo VARCHAR(100) NOT NULL, -- Nombre del insumo para validación
costo_unitario NUMERIC(10, 2) NOT NULL -- Precio base para el cálculo matemático
);
-- Registro final del cobro financiero al paciente
CREATE TABLE IF NOT EXISTS cuentas_medicas (
id SERIAL PRIMARY KEY,
pedido_id INT NOT NULL, -- Relación lógica con el origen del pedido
ficha_paciente_id VARCHAR(50) NOT NULL, -- ID único de la ficha clínica (expediente médico)
nombre_paciente VARCHAR(100) NOT NULL, -- Nombre completo del paciente asignado
costo_total NUMERIC(10, 2) NOT NULL, -- Monto acumulado total de la solicitud
estado_pago VARCHAR(50) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO, ANULADO
fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO insumos (insumo_id, nombre_insumo, costo_unitario) VALUES
(1, 'Tanque de Oxigeno 10L', 45000.00),
(2, 'Mascarilla Quirurgica KN95', 1200.00),
(3, 'Jeringa Desechable 5ml', 350.00),
(4, 'Guantes de Procedimiento Nitrilo', 150.00),
(5, 'Suero Fisiologico 0.9% 500ml', 2500.00),
(6, 'Aposito Esteril 10x10cm', 800.00),
(7, 'Cateter Intravenoso 18G', 1800.00),
(8, 'Alcohol Gel 1L', 5500.00);

INSERT INTO cuentas_medicas (pedido_id, ficha_paciente_id, nombre_paciente, costo_total, estado_pago) VALUES
(1, 'FICH-2026-0092', 'Juan Carlos Tapia', 131500.00, 'PENDIENTE'), 
-- Pedido 1: (2 * 45000) + (20 * 1200) + (50 * 350) = 131.500 CLP

(2, 'FICH-2025-1140', 'Maria Loreto Anabalón', 40000.00, 'PAGADO'),
-- Pedido 2: (100 * 150) + (10 * 2500) = 40.000 CLP

(3, 'FICH-2026-0105', 'Pedro Pablo Ramirez', 51000.00, 'PENDIENTE');
-- Pedido 3: (30 * 800) + (15 * 1800) = 51.000 CLP