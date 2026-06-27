import { producer, consumer } from "../../config/kafka";
import { TOPICS, pedidoCreadoSchema, reservadoSchema } from "./inventario.contracts";
import { reservarStock } from "./inventario.service";

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.PEDIDO_CREADO, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = JSON.parse(message.value!.toString());
      const pedido = pedidoCreadoSchema.parse(raw);

      console.log(`[S2] Pedido recibido ${pedido.pedidoId} — ${pedido.cantidad}x ${pedido.insumo}`);

      const resultado = await reservarStock(pedido);

      const evento = reservadoSchema.parse({
        pedidoId: pedido.pedidoId,
        insumo: pedido.insumo,
        cantidad: pedido.cantidad,
        pabellon: pedido.pabellon,
        fichaPaciente: pedido.fichaPaciente,
        unidadesReservadas: resultado.unidadesReservadas,
        bodegaId: resultado.bodegaId,
        estado: resultado.estado,
        timestamp: new Date().toISOString(),
      });

      await producer.send({
        topic: TOPICS.RESERVADO,
        messages: [{ key: pedido.pedidoId, value: JSON.stringify(evento) }],
      });

      console.log(`[S2] Publicado ${resultado.estado} para ${pedido.pedidoId}`);
    },
  });
}