import { producer, consumer } from "../../config/kafka";
import { TOPICS, reservadoSchema, procesoCompletadoSchema } from "./pedidos.contracts";
import { actualizarEstado } from "./pedidos.service";
import { emitir } from "./pedidos.sse";
import type { CrearPedidoInput } from "./pedidos.contracts";

export async function publicarPedidoCreado(pedidoId: string, data: CrearPedidoInput) {
  await producer.send({
    topic: TOPICS.PEDIDO_CREADO,
    messages: [
      {
        key: pedidoId,
        value: JSON.stringify({ pedidoId, ...data, timestamp: new Date().toISOString() }),
      },
    ],
  });
  // ya salió a buscar stock
  await actualizarEstado(pedidoId, "BUSCANDO_STOCK", {}, "Buscando stock en bodega");
  emitir("estado", { pedidoId, estado: "BUSCANDO_STOCK" });
}

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.RESERVADO, fromBeginning: false });
  await consumer.subscribe({ topic: TOPICS.PROCESO_COMPLETADO, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const raw = JSON.parse(message.value!.toString());

      if (topic === TOPICS.RESERVADO) {
        const ev = reservadoSchema.parse(raw);
        const detalle =
          ev.estado === "RESERVADO"
            ? `Reservadas: ${ev.unidadesReservadas.join(", ")}`
            : "Sin stock disponible";
        await actualizarEstado(ev.pedidoId, ev.estado, {}, detalle);
        emitir("estado", { pedidoId: ev.pedidoId, estado: ev.estado, detalle });
      }

      if (topic === TOPICS.PROCESO_COMPLETADO) {
        const ev = procesoCompletadoSchema.parse(raw);
        await actualizarEstado(
          ev.pedidoId,
          "COMPLETADO",
          { costoTotal: ev.costoTotal, folioContable: ev.folioContable },
          `Cobro emitido. Folio ${ev.folioContable}`
        );
        emitir("estado", {
          pedidoId: ev.pedidoId,
          estado: "COMPLETADO",
          costoTotal: ev.costoTotal,
          folioContable: ev.folioContable,
        });
      }
    },
  });
}