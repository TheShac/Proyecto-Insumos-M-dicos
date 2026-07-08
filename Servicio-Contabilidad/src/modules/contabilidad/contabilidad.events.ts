import { randomUUID } from "crypto";
import { producer, consumer } from "../../config/kafka";
import {
  TOPICS,
  wrapperSchema,
  stockReservadoDatosSchema,
} from "./contabilidad.contracts";
import { procesarItemReservado } from "./contabilidad.service";

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.STOCK_RESERVADO, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const raw = JSON.parse(message.value!.toString());
        const wrapper = wrapperSchema.parse(raw);
        const ev = stockReservadoDatosSchema.parse(wrapper.datos);

        if (ev.estado_reserva === "SIN_STOCK") {
          console.log(
            `[S3] Ítem sin stock recibido: ${ev.pedido_id}/${ev.insumo} ` +
            `(disponibles: ${ev.disponibles}, solicitados: ${ev.cantidad})`
          );
        }

        const resultado = await procesarItemReservado(ev);

        if (!resultado) return;

        await producer.send({
          topic: TOPICS.CUENTA_EMITIDA,
          messages: [
            {
              key: ev.pedido_id,
              value: JSON.stringify({
                id_evento: `evt-cont-${randomUUID().slice(0, 8)}`,
                timestamp: new Date().toISOString(),
                tipo_evento: "CUENTA_EMITIDA",
                origen_servicio: "servicio-contabilidad",
                datos: resultado,
              }),
            },
          ],
        });

        console.log(
          `[S3] CUENTA_EMITIDA publicada: ${resultado.cuenta_id} — ` +
          `pedido ${ev.pedido_id}`
        );

      } catch (err) {
        console.error("[S3] Error procesando mensaje:", err);
      }
    },
  });
}