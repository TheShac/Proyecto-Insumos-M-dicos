import { Request, Response } from "express";
import * as service from "./pedidos.service";
import { publicarPedidoCreado } from "./pedidos.events";
import { agregarCliente, quitarCliente } from "./pedidos.sse";
import type { CrearPedidoInput } from "./pedidos.contracts";

export async function crearPedido(req: Request, res: Response) {
  const data = req.body as CrearPedidoInput;
  const pedidoId = await service.crearPedido(data);
  // dispara la cadena asíncrona (no bloquea la respuesta)
  await publicarPedidoCreado(pedidoId, data);
  res.status(202).json({ pedidoId, estado: "RECIBIDO", mensaje: "Pedido en proceso" });
}

export async function listarPedidos(_req: Request, res: Response) {
  res.json(await service.listarPedidos());
}

export async function obtenerPedido(req: Request, res: Response) {
  const { id } = req.params;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "ID inválido" });
  }
  const pedido = await service.obtenerPedido(id);
  if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
  res.json(pedido);
}

// Stream SSE para el frontend
export function streamEstados(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`event: conectado\ndata: "ok"\n\n`);

  agregarCliente(res);
  req.on("close", () => quitarCliente(res));
}

export async function listarEventos(_req: Request, res: Response) {
  res.json(await service.listarEventos());
}