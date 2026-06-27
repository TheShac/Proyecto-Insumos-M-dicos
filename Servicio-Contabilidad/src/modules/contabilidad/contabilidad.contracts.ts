import { z } from "zod";

export const TOPICS = {
  RESERVADO: "insumos.reservado",
  PROCESO_COMPLETADO: "insumos.proceso.completado",
} as const;

// Evento que llega desde S2
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
export type Reservado = z.infer<typeof reservadoSchema>;

// Evento final que S3 publica hacia S1
export const procesoCompletadoSchema = z.object({
  pedidoId: z.string(),
  costoTotal: z.number(),
  folioContable: z.string(),
  fichaPaciente: z.string().optional(),
  estadoFinal: z.literal("COMPLETADO"),
  timestamp: z.string(),
});
export type ProcesoCompletado = z.infer<typeof procesoCompletadoSchema>;