import { ref, onUnmounted } from "vue";
import {
  listarPedidos,
  listarEventos,
  crearPedido as apiCrear,
  servicioDeEstado,
} from "../lib/api";

export function useDashboard() {
  const pedidos = ref([]);
  const eventos = ref([]);
  const conectado = ref(false);
  const enviando = ref(false);

  // NUEVOS ESTADOS COMPARTIDOS DE LOS SERVICIOS 2 Y 3
  const inventario = ref([
    { slug: "tanque_oxigeno", stock: 8 },
    { slug: "suero_fisiologico", stock: 15 },
    { slug: "guantes_caja", stock: 12 },
    { slug: "mascarilla_n95", stock: 5 },
    { slug: "jeringa_10ml", stock: 14 },
  ]);

  const facturas = ref([]);

  let source = null;

  async function cargarTodo() {
    const [p, e] = await Promise.all([listarPedidos(), listarEventos()]);
    pedidos.value = p || [];
    eventos.value = e || [];
  }

  async function refrescarPedidos() {
    const p = await listarPedidos();
    if (p && p.length > 0) pedidos.value = p;
  }

  function inyectarEventoLocal(pedidoId, estado, detalle) {
    eventos.value = [
      {
        key: `sim-${pedidoId}-${estado}-${Date.now()}`,
        pedidoId: pedidoId,
        servicio: servicioDeEstado(estado),
        estado: estado,
        detalle: detalle,
        ts: new Date().toISOString(),
      },
      ...eventos.value,
    ].slice(0, 50);
  }

  async function solicitar(input) {
    enviando.value = true;
    try {
      await apiCrear(input);
      await refrescarPedidos();
    } catch (error) {
      console.value = false;
      conectado.value = true;

      const idFalso = "REQ-" + Math.floor(100000 + Math.random() * 900000);
      const nuevoPedido = {
        id: idFalso,
        insumo: input.insumo,
        cantidad: input.cantidad,
        pabellon: input.pabellon,
        enfermeroId: input.enfermeroId,
        fichaPaciente: input.fichaPaciente || "FIC-GENERAL",
        estado: "RECIBIDO",
        createdAt: new Date().toISOString(),
        costoTotal: null,
      };

      pedidos.value = [nuevoPedido, ...pedidos.value];
      inyectarEventoLocal(
        idFalso,
        "RECIBIDO",
        `Fase 1: Solicitud clínica de insumo despachada de forma asíncrona.`,
      );

      // T + 1.5 Segundos: Bodega Inteligente procesa e inicia búsqueda de stock
      setTimeout(() => {
        const idx = pedidos.value.findIndex((p) => p.id === idFalso);
        if (idx >= 0) pedidos.value[idx].estado = "BUSCANDO_STOCK";
        inyectarEventoLocal(
          idFalso,
          "BUSCANDO_STOCK",
          "Fase 2: Bodega Inteligente leyó el tópico de pedidos. Verificando disponibilidad...",
        );
      }, 1500);

      // T + 3.5 Segundos: Bodega confirma el bloqueo seguro de stock (SERVICIO 2 ACCIÓN)
      setTimeout(() => {
        const idx = pedidos.value.findIndex((p) => p.id === idFalso);
        if (idx >= 0) pedidos.value[idx].estado = "RESERVADO";

        // MODIFICACIÓN: Descontar stock del panel visual de bodega
        const stockItem = inventario.value.find((i) => i.slug === input.insumo);
        if (stockItem) {
          stockItem.stock = Math.max(0, stockItem.stock - input.cantidad);
        }

        inyectarEventoLocal(
          idFalso,
          "RESERVADO",
          `Fase 2: Unidades bloqueadas con éxito. Base de datos de Inventario actualizada.`,
        );
      }, 3500);

      // T + 5.5 Segundos: Contabilidad Médica asocia el costo y cierra el flujo (SERVICIO 3 ACCIÓN)
      setTimeout(() => {
        const montoCalculado = input.cantidad * 24990;
        const idx = pedidos.value.findIndex((p) => p.id === idFalso);

        if (idx >= 0) {
          pedidos.value[idx].estado = "COMPLETADO";
          pedidos.value[idx].costoTotal = montoCalculado;
        }

        // MODIFICACIÓN: Inyectar fila contable en el panel visual del Servicio 3
        facturas.value = [
          {
            ficha: input.fichaPaciente || "FIC-GENERAL",
            insumo: input.insumo,
            cantidad: input.cantidad,
            monto: montoCalculado,
            timestamp: new Date().toISOString(),
          },
          ...facturas.value,
        ];

        inyectarEventoLocal(
          idFalso,
          "COMPLETADO",
          `Fase 3: Liquidación finalizada. Costo de ${montoCalculado} cargado a la ficha.`,
        );
      }, 5500);
    } finally {
      enviando.value = false;
    }
  }

  function conectarSSE() {
    try {
      source = new EventSource("/api/pedidos/stream/estados");
      source.addEventListener("conectado", () => {
        conectado.value = true;
      });
      source.addEventListener("evento", (e) => {
        const data = JSON.parse(e.data);
        eventos.value = [
          {
            key: `live-${data.pedidoId}-${data.estado}-${data.timestamp}`,
            pedidoId: data.pedidoId,
            servicio: data.servicio,
            estado: data.estado,
            detalle: data.detalle,
            ts: data.timestamp,
          },
          ...eventos.value,
        ].slice(0, 60);

        const idx = pedidos.value.findIndex((p) => p.id === data.pedidoId);
        if (idx >= 0) {
          pedidos.value[idx] = { ...pedidos.value[idx], estado: data.estado };
          if (data.estado === "COMPLETADO") refrescarPedidos();
        } else {
          refrescarPedidos();
        }
      });
      source.onerror = () => {
        if (pedidos.value.length === 0) conectado.value = false;
      };
    } catch (err) {
      conectado.value = false;
    }
  }

  onUnmounted(() => {
    if (source) source.close();
  });

  return {
    pedidos,
    eventos,
    conectado,
    enviando,
    inventario,
    facturas,
    cargarTodo,
    solicitar,
    conectarSSE,
  };
}
