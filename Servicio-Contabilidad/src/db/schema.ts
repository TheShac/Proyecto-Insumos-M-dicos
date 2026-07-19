import { pgTable, serial, varchar, integer, timestamp,  pgEnum, index, jsonb, unique} from "drizzle-orm/pg-core";

export const estadoReservaEnum = pgEnum("estado_reserva", [
  "RESERVADO",
  "SIN_STOCK",
]);

export const estadoPagoEnum = pgEnum("estado_pago", [
  "PENDIENTE",
  "PAGADO",
  "ANULADO",
]);

export const tarifas = pgTable("tarifas", {
  insumo: varchar("insumo", { length: 100 }).primaryKey(),
  precioUnitario: integer("precio_unitario").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const itemsPendientes = pgTable(
  "items_pendientes",
  {
    id: serial("id").primaryKey(),
    pedidoId: varchar("pedido_id", { length: 30 }).notNull(),
    insumo: varchar("insumo", { length: 100 }).notNull(),
    cantidad: integer("cantidad").notNull(),
    estadoReserva: estadoReservaEnum("estado_reserva").notNull(),
    seriales: jsonb("seriales").$type<string[]>(),
    totalItems: integer("total_items").notNull(),
    pabellon: varchar("pabellon", { length: 100 }).notNull(),
    fichaPaciente: varchar("ficha_paciente", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    unicoPorItem: unique("unico_pendiente_item").on(t.pedidoId, t.insumo),
    idxPedidoId: index("idx_pendientes_pedido").on(t.pedidoId),
  })
);

export const cuentasMedicas = pgTable("cuentas_medicas", {
  id: serial("id").primaryKey(),
  cuentaId: varchar("cuenta_id", { length: 50 }).notNull().unique(),
  pedidoId: varchar("pedido_id", { length: 30 }).notNull().unique(),
  fichaPaciente: varchar("ficha_paciente", { length: 50 }),
  pabellon: varchar("pabellon", { length: 100 }).notNull(),
  costoTotal: integer("costo_total").notNull(),
  estadoPago: estadoPagoEnum("estado_pago").notNull().default("PENDIENTE"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cuentaItems = pgTable(
  "cuenta_items",
  {
    id: serial("id").primaryKey(),
    cuentaId: varchar("cuenta_id", { length: 50 })
      .notNull()
      .references(() => cuentasMedicas.cuentaId, { onDelete: "cascade" }),
    insumo: varchar("insumo", { length: 100 }).notNull(),
    cantidad: integer("cantidad").notNull(),
    precioUnitario: integer("precio_unitario").notNull(),
    subtotal: integer("subtotal").notNull(),
  },
  (t) => ({
    idxCuentaId: index("idx_cuenta_items_cuenta").on(t.cuentaId),
  })
);