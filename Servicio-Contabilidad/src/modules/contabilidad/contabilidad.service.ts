import { eq, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { tarifas, comprobantes } from "../../db/schema";
import type { Reservado, ProcesoCompletado } from "./contabilidad.contracts";

function generarFolio(numero: number): string {
  const anio = new Date().getFullYear();
  return `CTB-${anio}-${String(numero).padStart(4, "0")}`;
}

export async function emitirComprobante(ev: Reservado): Promise<ProcesoCompletado> {
  // Idempotencia: si ya existe comprobante para este pedido, lo reutilizamos
  const previo = await db.select().from(comprobantes).where(eq(comprobantes.pedidoId, ev.pedidoId));
  if (previo[0]) {
    return {
      pedidoId: ev.pedidoId,
      costoTotal: previo[0].costoTotal,
      folioContable: previo[0].folio,
      fichaPaciente: previo[0].fichaPaciente ?? undefined,
      estadoFinal: "COMPLETADO",
      timestamp: new Date().toISOString(),
    };
  }

  return await db.transaction(async (tx) => {
    // Buscar la tarifa del insumo
    const tarifa = await tx.select().from(tarifas).where(eq(tarifas.insumo, ev.insumo));
    const precioUnitario = tarifa[0]?.precioUnitario ?? 0;
    const costoTotal = precioUnitario * ev.cantidad;

    // Folio secuencial: contamos comprobantes existentes + 1
    const [{ total }] = await tx
      .select({ total: sql<number>`count(*)` })
      .from(comprobantes);
    const folio = generarFolio(Number(total) + 1);

    await tx.insert(comprobantes).values({
      folio,
      pedidoId: ev.pedidoId,
      insumo: ev.insumo,
      cantidad: ev.cantidad,
      precioUnitario,
      costoTotal,
      fichaPaciente: ev.fichaPaciente,
      pabellon: ev.pabellon,
      estado: "EMITIDO",
    });

    return {
      pedidoId: ev.pedidoId,
      costoTotal,
      folioContable: folio,
      fichaPaciente: ev.fichaPaciente,
      estadoFinal: "COMPLETADO" as const,
      timestamp: new Date().toISOString(),
    };
  });
}