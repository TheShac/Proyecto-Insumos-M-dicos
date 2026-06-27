import { producer, consumer } from "../../config/kafka";
import { TOPICS, reservadoSchema } from "./contabilidad.contracts";
import { emitirComprobante } from "./contabilidad.service";

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.RESERVADO, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const raw = JSON.parse(message.value!.toString());
      const ev = reservadoSchema.parse(raw);

      // Si no hubo stock, no se factura: la cadena termina aquí
      if (ev.estado === "SIN_STOCK") {
        console.log(`[S3] ${ev.pedidoId} sin stock, no se emite cobro`);
        return;
      }

      console.log(`[S3] Reserva recibida ${ev.pedidoId}, calculando cobro...`);

      const completado = await emitirComprobante(ev);

      await producer.send({
        topic: TOPICS.PROCESO_COMPLETADO,
        messages: [{ key: ev.pedidoId, value: JSON.stringify(completado) }],
      });

      console.log(`[S3] Proceso completado ${ev.pedidoId}, folio ${completado.folioContable}`);
    },
  });
}