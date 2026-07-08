import { pgTable, serial, varchar, integer, timestamp, pgEnum, jsonb, unique, index,} from "drizzle-orm/pg-core";

export const estadoUnidadEnum = pgEnum("estado_unidad", ["DISPONIBLE", "RESERVADO", "DESPACHADO"]);
export const estadoReservaEnum = pgEnum("estado_reserva", ["RESERVADO", "SIN_STOCK"]);

export const unidadesInsumo = pgTable(
  "unidades_insumo",
  {
    id: serial("id").primaryKey(),
    serial: varchar("serial", { length: 50 }).notNull().unique(),
    insumo: varchar("insumo", { length: 100 }).notNull(),
    bodegaId: varchar("bodega_id", { length: 50 }).notNull(),
    estado: estadoUnidadEnum("estado").notNull().default("DISPONIBLE"),
    pedidoId: varchar("pedido_id", { length: 30 }),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    idxInsumoEstado: index("idx_unidades_insumo_estado").on(t.insumo, t.estado),
  })
);

export const reservas = pgTable(
  "reservas",
  {
    id: serial("id").primaryKey(),
    pedidoId: varchar("pedido_id", { length: 30 }).notNull(),
    insumo: varchar("insumo", { length: 100 }).notNull(),
    cantidad: integer("cantidad").notNull(),
    estado: estadoReservaEnum("estado").notNull(),
    seriales: jsonb("seriales").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    unicoPorItem: unique("unico_reserva_item").on(t.pedidoId, t.insumo),
  })
);