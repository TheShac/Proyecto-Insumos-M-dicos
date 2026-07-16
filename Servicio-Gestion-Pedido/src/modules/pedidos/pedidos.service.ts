import { eq, and, desc, inArray } from "drizzle-orm";
import { db } from "../../config/db";
import { pedidos, pedidoItems, historialEstados } from "../../db/schema";
import type { CrearPedidoInput } from "./pedidos.contracts";

function generarPedidoId(): string {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PED-${fecha}-${random}`;
}

export async function registrarHistorial(
  pedidoId: string,
  estado: string,
  detalle?: string
) {
  await db.insert(historialEstados).values({ pedidoId, estado, detalle });
}

export async function crearPedido(data: CrearPedidoInput): Promise<string> {
  const id = generarPedidoId();

  await db.transaction(async (tx) => {
    await tx.insert(pedidos).values({
      id,
      nombreEnfermero: data.nombre_enfermero,
      pabellon: data.pabellon,
      fichaPaciente: data.ficha_paciente,
      estado: "RECIBIDO",
    });

    await tx.insert(pedidoItems).values(
      data.items.map((item) => ({
        pedidoId: id,
        insumo: item.insumo,
        cantidad: item.cantidad,
        estado: "PENDIENTE" as const,
      }))
    );
  });

  await registrarHistorial(id, "RECIBIDO", "Pedido recibido");
  return id;
}

export async function listarPedidos() {
  const filas = await db.select().from(pedidos).orderBy(desc(pedidos.createdAt));
  if (filas.length === 0) return filas;

  const ids = filas.map((p) => p.id);
  const items = await db
    .select()
    .from(pedidoItems)
    .where(inArray(pedidoItems.pedidoId, ids));

  return filas.map((p) => ({
    ...p,
    items: items.filter((i) => i.pedidoId === p.id),
  }));
}

export async function obtenerPedido(id: string) {
  const fila = await db.select().from(pedidos).where(eq(pedidos.id, id));
  if (!fila[0]) return null;

  const items = await db
    .select()
    .from(pedidoItems)
    .where(eq(pedidoItems.pedidoId, id));

  return { ...fila[0], items };
}

export async function actualizarItemEstado(
  pedidoId: string,
  insumo: string,
  estado: "RESERVADO" | "SIN_STOCK"
) {
  await db
    .update(pedidoItems)
    .set({ estado })
    .where(
      and(eq(pedidoItems.pedidoId, pedidoId), eq(pedidoItems.insumo, insumo))
    );
}

export async function facturarItem(
  pedidoId: string,
  insumo: string,
  costoSubtotal: number
) {
  await db
    .update(pedidoItems)
    .set({ estado: "FACTURADO", costoSubtotal })
    .where(
      and(eq(pedidoItems.pedidoId, pedidoId), eq(pedidoItems.insumo, insumo))
    );
}

export async function recalcularEstadoPedido(pedidoId: string) {
  const items = await db
    .select()
    .from(pedidoItems)
    .where(eq(pedidoItems.pedidoId, pedidoId));

  const pendientes = items.filter((i) => i.estado === "PENDIENTE").length;
  const reservados = items.filter((i) => i.estado === "RESERVADO").length;
  const sinStock = items.filter((i) => i.estado === "SIN_STOCK").length;

  if (pendientes > 0) return "BUSCANDO_STOCK" as const;
  if (reservados === items.length) return "RESERVADO" as const;
  if (sinStock === items.length) return "SIN_STOCK" as const;
  return "PARCIAL" as const;
}

export async function actualizarPedido(
  id: string,
  campos: Partial<{
    estado: "RECIBIDO" | "BUSCANDO_STOCK" | "RESERVADO" | "PARCIAL" | "SIN_STOCK" | "COMPLETADO";
    costoTotal: number;
    cuentaId: string;
    updatedAt: Date;
  }>
) {
  await db
    .update(pedidos)
    .set({ ...campos, updatedAt: new Date() })
    .where(eq(pedidos.id, id));
}

export async function listarEventos(limite = 60) {
  return db
    .select()
    .from(historialEstados)
    .orderBy(desc(historialEstados.createdAt))
    .limit(limite);
}