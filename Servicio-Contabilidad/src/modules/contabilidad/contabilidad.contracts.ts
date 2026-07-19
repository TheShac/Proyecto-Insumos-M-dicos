import { z } from "zod";

export const TOPICS = {
  STOCK_RESERVADO: "insumos.reservado",
  CUENTA_EMITIDA: "insumos.proceso.completado",
} as const;

export const wrapperSchema = z.object({
  id_evento: z.string(),
  timestamp: z.string(),
  tipo_evento: z.string(),
  origen_servicio: z.string(),
  datos: z.unknown(),
});

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

export const cuentaEmitidaDatosSchema = z.object({
  cuenta_id: z.string(),
  pedido_id: z.string(),
  costo_total: z.number(),
  estado_pago: z.literal("PENDIENTE"),
  ficha_paciente: z.string().optional(),
  items_facturados: z.array(z.object({
    insumo: z.string(),
    cantidad: z.number(),
    precio_unitario: z.number(),
    subtotal: z.number(),
  })),
});
export type CuentaEmitidaDatos = z.infer<typeof cuentaEmitidaDatosSchema>;