import { z } from "zod";

export const TOPICS = {
  PEDIDO_CREADO: "insumos.pedido.creado",
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

const itemInputSchema = z.object({
  insumo: z.string().min(1),
  cantidad: z.number().int().positive(),
});

export const crearPedidoSchema = z.object({
  nombre_enfermero: z.string().min(1),
  pabellon: z.string().min(1),
  ficha_paciente: z.string().optional(),
  items: z.array(itemInputSchema).min(1, "Debe incluir al menos un insumo"),
});
export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>;

export const pedidoCreadoDatosSchema = z.object({
  pedido_id: z.string(),
  nombre_enfermero: z.string(),
  pabellon: z.string(),
  ficha_paciente: z.string().optional(),
  items: z.array(z.object({
    insumo: z.string(),
    cantidad: z.number(),
  })),
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