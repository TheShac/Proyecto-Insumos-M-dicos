import { eq, and, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { unidadesInsumo, reservas } from "../../db/schema";

export async function consultarStock() {
  return db
    .select({
      insumo: unidadesInsumo.insumo,
      disponibles: sql<number>`count(*) filter (where ${unidadesInsumo.estado} = 'DISPONIBLE')`.mapWith(Number),
      reservadas: sql<number>`count(*) filter (where ${unidadesInsumo.estado} = 'RESERVADO')`.mapWith(Number),
      despachadas: sql<number>`count(*) filter (where ${unidadesInsumo.estado} = 'DESPACHADO')`.mapWith(Number),
      total: sql<number>`count(*)`.mapWith(Number),
    })
    .from(unidadesInsumo)
    .groupBy(unidadesInsumo.insumo)
    .orderBy(unidadesInsumo.insumo);
}

type ResultadoReserva = {
  estado: "RESERVADO" | "SIN_STOCK";
  unidadesReservadas: string[];
  disponibles: number;
};

export async function reservarStockItem(params: {
  pedidoId: string;
  insumo: string;
  cantidad: number;
}): Promise<ResultadoReserva> {

  const previa = await db
    .select()
    .from(reservas)
    .where(
      and(
        eq(reservas.pedidoId, params.pedidoId),
        eq(reservas.insumo, params.insumo)
      )
    );

  if (previa[0]) {
    console.log(`[S2] Reserva ya existente para ${params.pedidoId}/${params.insumo}, reutilizando`);
    return {
      estado: previa[0].estado,
      unidadesReservadas: (previa[0].seriales as string[]) ?? [],
      disponibles: 0,
    };
  }

  return await db.transaction(async (tx) => {

    const disponibles = await tx
      .select()
      .from(unidadesInsumo)
      .where(
        and(
          eq(unidadesInsumo.insumo, params.insumo),
          eq(unidadesInsumo.estado, "DISPONIBLE")
        )
      )
      .limit(params.cantidad)
      .for("update");

    const cantidadDisponible = disponibles.length;

    if (cantidadDisponible < params.cantidad) {
      await tx.insert(reservas).values({
        pedidoId: params.pedidoId,
        insumo: params.insumo,
        cantidad: params.cantidad,
        estado: "SIN_STOCK",
        seriales: [],
      });

      return {
        estado: "SIN_STOCK" as const,
        unidadesReservadas: [],
        disponibles: cantidadDisponible,
      };
    }

    const seriales = disponibles.map((u) => u.serial);

    for (const unidad of disponibles) {
      await tx
        .update(unidadesInsumo)
        .set({
          estado: "RESERVADO",
          pedidoId: params.pedidoId,
          updatedAt: new Date(),
        })
        .where(eq(unidadesInsumo.id, unidad.id));
    }

    await tx.insert(reservas).values({
      pedidoId: params.pedidoId,
      insumo: params.insumo,
      cantidad: params.cantidad,
      estado: "RESERVADO",
      seriales,
    });

    return {
      estado: "RESERVADO" as const,
      unidadesReservadas: seriales,
      disponibles: cantidadDisponible,
    };
  });
}