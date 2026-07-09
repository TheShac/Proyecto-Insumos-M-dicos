import { eq, sql } from "drizzle-orm";
import { db } from "../../config/db";
import {
  tarifas,
  itemsPendientes,
  cuentasMedicas,
  cuentaItems,
} from "../../db/schema";
import type { StockReservadoDatos, CuentaEmitidaDatos } from "./contabilidad.contracts";

function generarFolio(numero: number): string {
  const anio = new Date().getFullYear();
  return `CTB-${anio}-${String(numero).padStart(4, "0")}`;
}

export async function procesarItemReservado(
  ev: StockReservadoDatos
): Promise<CuentaEmitidaDatos | null> {

  try {
    await db.insert(itemsPendientes).values({
      pedidoId: ev.pedido_id,
      insumo: ev.insumo,
      cantidad: ev.cantidad,
      estadoReserva: ev.estado_reserva,
      seriales: ev.unidades_reservadas,
      totalItems: ev.total_items,
      pabellon: ev.pabellon,
      fichaPaciente: ev.ficha_paciente,
    });
  } catch (err: any) {
    if (err.code === "23505") {
      console.log(`[S3] Ítem duplicado ignorado: ${ev.pedido_id}/${ev.insumo}`);
    } else {
      throw err;
    }
  }

  const recibidos = await db
    .select()
    .from(itemsPendientes)
    .where(eq(itemsPendientes.pedidoId, ev.pedido_id));

  console.log(
    `[S3] ${ev.pedido_id}: ${recibidos.length}/${ev.total_items} ítem(s) recibido(s)`
  );

  if (recibidos.length < ev.total_items) {
    return null;
  }

  const cuentaExistente = await db
    .select()
    .from(cuentasMedicas)
    .where(eq(cuentasMedicas.pedidoId, ev.pedido_id));

  if (cuentaExistente[0]) {
    console.log(`[S3] Cuenta ya emitida para ${ev.pedido_id}, omitiendo`);
    return null;
  }

  return await emitirCuenta(recibidos, ev.pedido_id);
}

type ItemPendiente = typeof itemsPendientes.$inferSelect;

async function emitirCuenta(
  items: ItemPendiente[],
  pedidoId: string
): Promise<CuentaEmitidaDatos> {

  return await db.transaction(async (tx) => {
    const contexto = items[0];

    const itemsFacturables = items.filter(
      (i) => i.estadoReserva === "RESERVADO"
    );

    const itemsConPrecio: {
      insumo: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }[] = [];

    let costoTotal = 0;

    for (const item of itemsFacturables) {
      const tarifa = await tx
        .select()
        .from(tarifas)
        .where(eq(tarifas.insumo, item.insumo));

      const precioUnitario = tarifa[0]?.precioUnitario ?? 0;
      const subtotal = precioUnitario * item.cantidad;

      costoTotal += subtotal;

      itemsConPrecio.push({
        insumo: item.insumo,
        cantidad: item.cantidad,
        precioUnitario,
        subtotal,
      });
    }

    const [{ total }] = await tx
      .select({ total: sql<number>`count(*)` })
      .from(cuentasMedicas);

    const cuentaId = generarFolio(Number(total) + 1);

    await tx.insert(cuentasMedicas).values({
      cuentaId,
      pedidoId,
      fichaPaciente: contexto.fichaPaciente,
      pabellon: contexto.pabellon,
      costoTotal,
      estadoPago: "PENDIENTE",
    });

    if (itemsConPrecio.length > 0) {
      await tx.insert(cuentaItems).values(
        itemsConPrecio.map((item) => ({
          cuentaId,
          ...item,
        }))
      );
    }

    console.log(
      `[S3] Cuenta emitida ${cuentaId} para ${pedidoId} — ` +
      `$${costoTotal.toLocaleString("es-CL")} ` +
      `(${itemsConPrecio.length} ítem(s) facturado(s), ` +
      `${items.length - itemsConPrecio.length} sin stock)`
    );

    return {
      cuenta_id: cuentaId,
      pedido_id: pedidoId,
      costo_total: costoTotal,
      estado_pago: "PENDIENTE",
      ficha_paciente: contexto.fichaPaciente ?? undefined,
      items_facturados: itemsConPrecio.map((item) => ({
        insumo: item.insumo,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario,
        subtotal: item.subtotal,
      })),
    };
  });
}