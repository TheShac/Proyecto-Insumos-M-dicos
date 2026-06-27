import { z } from "zod";

export const TOPICS = {
  PEDIDO_CREADO: "insumos.pedido.creado",
  RESERVADO: "insumos.reservado",
} as const;

// Evento que llega desde S1
export const pedidoCreadoSchema = z.object({
  pedidoId: z.string(),
  insumo: z.string(),
  cantidad: z.number().int().positive(),
  pabellon: z.string(),
  fichaPaciente: z.string().optional(),
  enfermeroId: z.string(),
  timestamp: z.string(),
});
export type PedidoCreado = z.infer<typeof pedidoCreadoSchema>;

// Evento que S2 publica hacia S3 (arrastra el contexto del pedido)
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
  disponibles: z.number(),
});
export type Reservado = z.infer<typeof reservadoSchema>;