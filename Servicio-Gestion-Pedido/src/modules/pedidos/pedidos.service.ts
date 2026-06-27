import { randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db";
import { pedidos, historialEstados } from "../../db/schema";
import type { CrearPedidoInput } from "./pedidos.contracts";

async function registrarHistorial(pedidoId: string, estado: string, detalle?: string) {
  await db.insert(historialEstados).values({ pedidoId, estado, detalle });
}

export async function crearPedido(data: CrearPedidoInput) {
  const id = randomUUID();
  await db.insert(pedidos).values({ id, ...data, estado: "RECIBIDO" });
  await registrarHistorial(id, "RECIBIDO", "Pedido recibido");
  return id;
}

export async function listarPedidos() {
  return db.select().from(pedidos).orderBy(desc(pedidos.createdAt));
}

export async function obtenerPedido(id: string) {
  const filas = await db.select().from(pedidos).where(eq(pedidos.id, id));
  return filas[0] ?? null;
}

export async function actualizarEstado(
  id: string,
  estado: "BUSCANDO_STOCK" | "RESERVADO" | "SIN_STOCK" | "COMPLETADO",
  extra: Partial<{ costoTotal: number; folioContable: string }> = {},
  detalle?: string
) {
  await db.update(pedidos).set({ estado, ...extra }).where(eq(pedidos.id, id));
  await registrarHistorial(id, estado, detalle);
}

export async function listarEventos(limite = 30) {
  return db.select().from(historialEstados).orderBy(desc(historialEstados.createdAt)).limit(limite);
}