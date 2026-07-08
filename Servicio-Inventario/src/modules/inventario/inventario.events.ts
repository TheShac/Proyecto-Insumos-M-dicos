import { randomUUID } from "crypto";
import { producer, consumer } from "../../config/kafka";
import {
  TOPICS,
  wrapperSchema,
  pedidoCreadoDatosSchema,
} from "./inventario.contracts";
import { reservarStockItem } from "./inventario.service";

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.PEDIDO_CREADO, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const raw = JSON.parse(message.value!.toString());
        const wrapper = wrapperSchema.parse(raw);
        const datos = pedidoCreadoDatosSchema.parse(wrapper.datos);

        console.log(
          `[S2] Pedido recibido ${datos.pedido_id} — ` +
          `${datos.items.length} ítem(s): ${datos.items.map(i => `${i.cantidad}x ${i.insumo}`).join(", ")}`
        );

        for (const item of datos.items) {
          const resultado = await reservarStockItem({
            pedidoId: datos.pedido_id,
            insumo: item.insumo,
            cantidad: item.cantidad,
          });

          await producer.send({
            topic: TOPICS.STOCK_RESERVADO,
            messages: [
              {
                key: datos.pedido_id,
                value: JSON.stringify({
                  id_evento: `evt-inv-${randomUUID().slice(0, 8)}`,
                  timestamp: new Date().toISOString(),
                  tipo_evento: "STOCK_RESERVADO",
                  origen_servicio: "servicio-inventario",
                  datos: {
                    pedido_id: datos.pedido_id,
                    insumo: item.insumo,
                    cantidad: item.cantidad,
                    estado_reserva: resultado.estado,
                    unidades_reservadas: resultado.unidadesReservadas,
                    disponibles: resultado.disponibles,
                    total_items: datos.items.length,
                    pabellon: datos.pabellon,
                    ficha_paciente: datos.ficha_paciente,
                  },
                }),
              },
            ],
          });

          console.log(
            `[S2] ${datos.pedido_id}/${item.insumo} → ` +
            `${resultado.estado} ` +
            (resultado.estado === "RESERVADO"
              ? `[${resultado.unidadesReservadas.join(", ")}]`
              : `(disponibles: ${resultado.disponibles}, solicitados: ${item.cantidad})`)
          );
        }

      } catch (err) {
        console.error("[S2] Error procesando mensaje:", err);
      }
    },
  });
}