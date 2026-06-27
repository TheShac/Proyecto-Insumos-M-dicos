import { z } from "zod";

// Nombres de topics (fuente única de verdad)
export const TOPICS = {
  PEDIDO_CREADO: "insumos.pedido.creado",
  RESERVADO: "insumos.reservado",
  PROCESO_COMPLETADO: "insumos.proceso.completado",
} as const;

// Body que envía el frontend al crear un pedido
export const crearPedidoSchema = z.object({
  insumo: z.string().min(1),
  cantidad: z.number().int().positive(),
  pabellon: z.string().min(1),
  fichaPaciente: z.string().optional(),
  enfermeroId: z.string().min(1),
});
export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>;

// Evento que S1 publica
export const pedidoCreadoSchema = crearPedidoSchema.extend({
  pedidoId: z.string(),
  timestamp: z.string(),
});

// Evento que S1 recibe desde S2
export const reservadoSchema = z.object({
  pedidoId: z.string(),
  insumo: z.string(),
  cantidad: z.number(),
  pabellon: z.string(),
  fichaPaciente: z.string().optional(),
  unidadesReservadas: z.array(z.string()),
  bodegaId: z.string(),
  estado: z.enum(["RESERVADO", "SIN_STOCK"]),
  timestamp: z.string(),
});

// Evento final que S1 recibe desde S3
export const procesoCompletadoSchema = z.object({
  pedidoId: z.string(),
  costoTotal: z.number(),
  folioContable: z.string(),
  fichaPaciente: z.string().optional(),
  estadoFinal: z.literal("COMPLETADO"),
  timestamp: z.string(),
});