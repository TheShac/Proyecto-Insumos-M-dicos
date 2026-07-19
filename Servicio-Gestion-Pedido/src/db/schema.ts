import { pgTable, index, varchar, integer, timestamp, pgEnum, serial, unique,} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const estadoPedidoEnum = pgEnum("estado_pedido", [
  "RECIBIDO", "BUSCANDO_STOCK", "RESERVADO", "PARCIAL", "SIN_STOCK", "COMPLETADO",
]);

export const estadoItemEnum = pgEnum("estado_item", [
  "PENDIENTE", "RESERVADO", "SIN_STOCK", "FACTURADO",
]);

export const pedidos = pgTable("pedidos", {
  id: varchar("id", { length: 30 }).primaryKey(),
  nombreEnfermero: varchar("nombre_enfermero", { length: 100 }).notNull(),
  pabellon: varchar("pabellon", { length: 100 }).notNull(),
  fichaPaciente: varchar("ficha_paciente", { length: 50 }),
  estado: estadoPedidoEnum("estado").notNull().default("RECIBIDO"),
  costoTotal: integer("costo_total"),
  cuentaId: varchar("cuenta_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pedidoItems = pgTable(
  "pedido_items",
  {
    id: serial("id").primaryKey(),
    pedidoId: varchar("pedido_id", { length: 30 })
      .notNull()
      .references(() => pedidos.id, { onDelete: "cascade" }),
    insumo: varchar("insumo", { length: 100 }).notNull(),
    cantidad: integer("cantidad").notNull(),
    estado: estadoItemEnum("estado").notNull().default("PENDIENTE"),
    costoSubtotal: integer("costo_subtotal"),
  },
  (t) => ({
    unicoPorInsumo: unique("unico_pedido_insumo").on(t.pedidoId, t.insumo),
    idxPedidoId: index("idx_items_pedido_id").on(t.pedidoId),
  })
);

export const historialEstados = pgTable(
  "historial_estados",
  {
    id: serial("id").primaryKey(),
    pedidoId: varchar("pedido_id", { length: 30 })
      .notNull()
      .references(() => pedidos.id, { onDelete: "cascade" }),
    estado: varchar("estado", { length: 30 }).notNull(),
    detalle: varchar("detalle", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    idxHistorialPedido: index("idx_historial_pedido").on(t.pedidoId),
  })
);