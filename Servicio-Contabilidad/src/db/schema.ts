import { mysqlTable, varchar, int, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const tarifas = mysqlTable("tarifas", {
  id: int("id").autoincrement().primaryKey(),
  insumo: varchar("insumo", { length: 100 }).notNull().unique(),
  precioUnitario: int("precio_unitario").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const comprobantes = mysqlTable("comprobantes", {
  id: int("id").autoincrement().primaryKey(),
  folio: varchar("folio", { length: 50 }).notNull().unique(),
  pedidoId: varchar("pedido_id", { length: 36 }).notNull().unique(),
  insumo: varchar("insumo", { length: 100 }).notNull(),
  cantidad: int("cantidad").notNull(),
  precioUnitario: int("precio_unitario").notNull(),
  costoTotal: int("costo_total").notNull(),
  fichaPaciente: varchar("ficha_paciente", { length: 50 }),
  pabellon: varchar("pabellon", { length: 50 }).notNull(),
  estado: mysqlEnum("estado", ["EMITIDO"]).notNull().default("EMITIDO"),
  createdAt: timestamp("created_at").defaultNow(),
});