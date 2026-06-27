import { eq, and } from "drizzle-orm";
import { db } from "../../config/db";
import { unidadesInsumo, reservas } from "../../db/schema";
import type { PedidoCreado, Reservado } from "./inventario.contracts";

type ResultadoReserva = {
  estado: "RESERVADO" | "SIN_STOCK";
  unidadesReservadas: string[];
  bodegaId: string;
};

export async function reservarStock(pedido: PedidoCreado): Promise<ResultadoReserva> {
  // Idempotencia: si ya reservamos este pedido, devolvemos lo guardado
  const previa = await db.select().from(reservas).where(eq(reservas.pedidoId, pedido.pedidoId));
  if (previa[0]) {
    return {
      estado: previa[0].estado,
      unidadesReservadas: (previa[0].seriales as string[]) ?? [],
      bodegaId: "BOD-CENTRAL",
    };
  }

  return await db.transaction(async (tx) => {
    // Buscar unidades disponibles del insumo pedido
    const disponibles = await tx
      .select()
      .from(unidadesInsumo)
      .where(and(eq(unidadesInsumo.insumo, pedido.insumo), eq(unidadesInsumo.estado, "DISPONIBLE")))
      .limit(pedido.cantidad)
      .for("update"); // bloqueo de filas para evitar reservas simultáneas

    if (disponibles.length < pedido.cantidad) {
      await tx.insert(reservas).values({
        pedidoId: pedido.pedidoId,
        insumo: pedido.insumo,
        cantidad: pedido.cantidad,
        estado: "SIN_STOCK",
        seriales: [],
      });
      return { estado: "SIN_STOCK", unidadesReservadas: [], bodegaId: "BOD-CENTRAL" };
    }

    const seriales = disponibles.map((u) => u.serial);
    const bodegaId = disponibles[0].bodegaId;

    // Marcar cada unidad como RESERVADA y atarla al pedido
    for (const unidad of disponibles) {
      await tx
        .update(unidadesInsumo)
        .set({ estado: "RESERVADO", pedidoId: pedido.pedidoId })
        .where(eq(unidadesInsumo.id, unidad.id));
    }

    await tx.insert(reservas).values({
      pedidoId: pedido.pedidoId,
      insumo: pedido.insumo,
      cantidad: pedido.cantidad,
      estado: "RESERVADO",
      seriales,
    });

    return { estado: "RESERVADO", unidadesReservadas: seriales, bodegaId };
  });
}