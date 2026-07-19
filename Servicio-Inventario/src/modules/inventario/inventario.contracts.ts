import { z } from "zod";

export const TOPICS = {
  PEDIDO_CREADO: "insumos.pedido.creado",
  STOCK_RESERVADO: "insumos.reservado",
} as const;

export const wrapperSchema = z.object({
  id_evento: z.string(),
  timestamp: z.string(),
  tipo_evento: z.string(),
  origen_servicio: z.string(),
  datos: z.unknown(),
});

export const pedidoCreadoDatosSchema = z.object({
  pedido_id: z.string(),
  nombre_enfermero: z.string(),
  pabellon: z.string(),
  ficha_paciente: z.string().optional(),
  items: z.array(z.object({
    insumo: z.string(),
    cantidad: z.number().int().positive(),
  })),
});
export type PedidoCreadoDatos = z.infer<typeof pedidoCreadoDatosSchema>;

export const stockReservadoDatosSchema = z.object({
  pedido_id: z.string(),
  insumo: z.string(),
  cantidad: z.number(),
  estado_reserva: z.enum(["RESERVADO", "SIN_STOCK"]),
  unidades_reservadas: z.array(z.string()),
  disponibles: z.number(),
  total_items: z.number(),
  pabellon: z.string(),
  ficha_paciente: z.string().optional(),
});
export type StockReservadoDatos = z.infer<typeof stockReservadoDatosSchema>;