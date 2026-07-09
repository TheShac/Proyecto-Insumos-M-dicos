import { Response } from "express";

const clientes = new Set<Response>();

export function agregarCliente(res: Response) {
  clientes.add(res);
}

export function quitarCliente(res: Response) {
  clientes.delete(res);
}

export function emitir(evento: string, data: unknown) {
  const payload = `event: ${evento}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clientes) res.write(payload);
}