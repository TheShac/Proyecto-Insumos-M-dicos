import { producer, consumer } from "../../config/kafka";
import { TOPICS, reservadoSchema, procesoCompletadoSchema } from "./pedidos.contracts";
import { actualizarEstado } from "./pedidos.service";
import { emitir } from "./pedidos.sse";
import type { CrearPedidoInput } from "./pedidos.contracts";

export async function publicarPedidoCreado(pedidoId: string, data: CrearPedidoInput) {
  await producer.send({
    topic: TOPICS.PEDIDO_CREADO,
    messages: [
      { key: pedidoId, value: JSON.stringify({ pedidoId, ...data, timestamp: new Date().toISOString() }) },
    ],
  });

  await actualizarEstado(pedidoId, "BUSCANDO_STOCK", {}, "Pedido recibido. Búsqueda en bodegas iniciada.");
  emitir("evento", {
    pedidoId,
    servicio: "Gestión de Pedidos",
    estado: "BUSCANDO_STOCK",
    detalle: "Pedido recibido. Búsqueda en bodegas iniciada.",
    timestamp: new Date().toISOString(),
  });
}

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.RESERVADO, fromBeginning: false });
  await consumer.subscribe({ topic: TOPICS.PROCESO_COMPLETADO, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const raw = JSON.parse(message.value!.toString());

        if (topic === TOPICS.RESERVADO) {
          const ev = reservadoSchema.parse(raw);
          const detalle =
            ev.estado === "RESERVADO"
              ? `Reservadas ${ev.cantidad}x ${ev.insumo}. Listo para despacho.`
              : `Sin stock suficiente. Disponibles: ${ev.disponibles}, solicitados: ${ev.cantidad}.`;
          await actualizarEstado(ev.pedidoId, ev.estado, {}, detalle);
          emitir("evento", {
            pedidoId: ev.pedidoId,
            servicio: "Inventario de Bodega",
            estado: ev.estado,
            detalle,
            timestamp: new Date().toISOString(),
          });
        }

        if (topic === TOPICS.PROCESO_COMPLETADO) {
          const ev = procesoCompletadoSchema.parse(raw);
          const detalle = `Costo $${ev.costoTotal.toLocaleString("es-CL")} asociado a la ficha. Proceso finalizado.`;
          await actualizarEstado(ev.pedidoId, "COMPLETADO",
            { costoTotal: ev.costoTotal, folioContable: ev.folioContable }, detalle);
          emitir("evento", {
            pedidoId: ev.pedidoId,
            servicio: "Contabilidad Médica",
            estado: "COMPLETADO",
            detalle,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error(`[S1] Error procesando mensaje de ${topic}:`, err);
      }
    },
  });
}