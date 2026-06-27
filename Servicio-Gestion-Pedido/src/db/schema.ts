import { mysqlTable, varchar, int, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const pedidos = mysqlTable("pedidos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  insumo: varchar("insumo", { length: 100 }).notNull(),
  cantidad: int("cantidad").notNull(),
  pabellon: varchar("pabellon", { length: 50 }).notNull(),
  fichaPaciente: varchar("ficha_paciente", { length: 50 }),
  enfermeroId: varchar("enfermero_id", { length: 50 }).notNull(),
  estado: mysqlEnum("estado", ["RECIBIDO", "BUSCANDO_STOCK", "RESERVADO", "SIN_STOCK", "COMPLETADO"])
    .notNull().default("RECIBIDO"),
  costoTotal: int("costo_total"),
  folioContable: varchar("folio_contable", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const historialEstados = mysqlTable("historial_estados", {
  id: int("id").autoincrement().primaryKey(),
  pedidoId: varchar("pedido_id", { length: 36 }).notNull(),
  estado: varchar("estado", { length: 30 }).notNull(),
  detalle: varchar("detalle", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});