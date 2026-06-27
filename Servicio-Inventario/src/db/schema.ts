import { mysqlTable, varchar, int, timestamp, mysqlEnum, json } from "drizzle-orm/mysql-core";

export const unidadesInsumo = mysqlTable("unidades_insumo", {
  id: int("id").autoincrement().primaryKey(),
  serial: varchar("serial", { length: 50 }).notNull().unique(),
  insumo: varchar("insumo", { length: 100 }).notNull(),
  bodegaId: varchar("bodega_id", { length: 50 }).notNull(),
  estado: mysqlEnum("estado", ["DISPONIBLE", "RESERVADO", "DESPACHADO"]).notNull().default("DISPONIBLE"),
  pedidoId: varchar("pedido_id", { length: 36 }),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const reservas = mysqlTable("reservas", {
  id: int("id").autoincrement().primaryKey(),
  pedidoId: varchar("pedido_id", { length: 36 }).notNull().unique(),
  insumo: varchar("insumo", { length: 100 }).notNull(),
  cantidad: int("cantidad").notNull(),
  estado: mysqlEnum("estado", ["RESERVADO", "SIN_STOCK"]).notNull(),
  seriales: json("seriales").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});