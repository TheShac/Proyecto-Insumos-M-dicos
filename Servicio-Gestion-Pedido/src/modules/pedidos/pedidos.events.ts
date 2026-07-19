import { randomUUID } from "crypto";
import { producer, consumer } from "../../config/kafka";
import {
  TOPICS,
  wrapperSchema,
  stockReservadoDatosSchema,
  cuentaEmitidaDatosSchema,
} from "./pedidos.contracts";
import {
  actualizarItemEstado,
  facturarItem,
  recalcularEstadoPedido,
  actualizarPedido,
  registrarHistorial,
} from "./pedidos.service";
import { emitir } from "./pedidos.sse";
import type { CrearPedidoInput } from "./pedidos.contracts";

export async function publicarPedidoCreado(
  pedidoId: string,
  data: CrearPedidoInput
) {
  await producer.send({
    topic: TOPICS.PEDIDO_CREADO,
    messages: [
      {
        key: pedidoId,
        value: JSON.stringify({
          id_evento: `evt-pedidos-${randomUUID().slice(0, 8)}`,
          timestamp: new Date().toISOString(),
          tipo_evento: "PEDIDO_CREADO",
          origen_servicio: "servicio-pedidos",
          datos: {
            pedido_id: pedidoId,
            nombre_enfermero: data.nombre_enfermero,
            pabellon: data.pabellon,
            ficha_paciente: data.ficha_paciente,
            items: data.items,
          },
        }),
      },
    ],
  });

  await actualizarPedido(pedidoId, { estado: "BUSCANDO_STOCK" });
  await registrarHistorial(
    pedidoId,
    "BUSCANDO_STOCK",
    `Búsqueda de ${data.items.length} insumo(s) iniciada en bodega.`
  );

  emitir("evento", {
    pedido_id: pedidoId,
    servicio: "Gestión de Pedidos",
    estado: "BUSCANDO_STOCK",
    detalle: `Búsqueda de ${data.items.length} insumo(s) iniciada en bodega.`,
    timestamp: new Date().toISOString(),
  });
}

export async function iniciarConsumidores() {
  await consumer.subscribe({ topic: TOPICS.STOCK_RESERVADO, fromBeginning: false });
  await consumer.subscribe({ topic: TOPICS.CUENTA_EMITIDA, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const raw = JSON.parse(message.value!.toString());
        const wrapper = wrapperSchema.parse(raw);

        if (topic === TOPICS.STOCK_RESERVADO) {
          const ev = stockReservadoDatosSchema.parse(wrapper.datos);

          await actualizarItemEstado(ev.pedido_id, ev.insumo, ev.estado_reserva);

          const nuevoEstado = await recalcularEstadoPedido(ev.pedido_id);
          await actualizarPedido(ev.pedido_id, { estado: nuevoEstado });

          const detalle =
            ev.estado_reserva === "RESERVADO"
              ? `${ev.insumo}: Reservadas [${ev.unidades_reservadas.join(", ")}].`
              : `${ev.insumo}: Sin stock. Disponibles: ${ev.disponibles}, solicitados: ${ev.cantidad}.`;

          await registrarHistorial(ev.pedido_id, nuevoEstado, detalle);

          emitir("evento", {
            pedido_id: ev.pedido_id,
            servicio: "Inventario de Bodega",
            estado: nuevoEstado,
            detalle,
            timestamp: new Date().toISOString(),
          });
        }

        if (topic === TOPICS.CUENTA_EMITIDA) {
          const ev = cuentaEmitidaDatosSchema.parse(wrapper.datos);

          await actualizarPedido(ev.pedido_id, {
            estado: "COMPLETADO",
            costoTotal: ev.costo_total,
            cuentaId: ev.cuenta_id,
          });

          for (const item of ev.items_facturados) {
            await facturarItem(ev.pedido_id, item.insumo, item.subtotal);
          }

          const detalle = `Costo $${ev.costo_total.toLocaleString("es-CL")} asociado a la ficha. Folio ${ev.cuenta_id}.`;
          await registrarHistorial(ev.pedido_id, "COMPLETADO", detalle);

          emitir("evento", {
            pedido_id: ev.pedido_id,
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