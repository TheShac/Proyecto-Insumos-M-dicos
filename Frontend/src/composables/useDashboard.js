import { ref, onUnmounted } from "vue";
import {
  listarPedidos,
  listarEventos,
  crearPedido as apiCrear,
  obtenerStock,
  listarCuentas,
  servicioDeEstado,
} from "../lib/api";

export function useDashboard() {
  const pedidos = ref([]);
  const eventos = ref([]);
  const conectado = ref(false);
  const enviando = ref(false);
  const errorEnvio = ref("");

  // Datos reales de los servicios 2 y 3 (vía API Gateway, solo lectura)
  const inventario = ref([]);
  const facturas = ref([]);

  let source = null;

  // Las filas del historial vienen como {id, pedidoId, estado, detalle, createdAt};
  // el feed espera {key, pedidoId, servicio, estado, detalle, ts}.
  function mapearEvento(fila) {
    return {
      key: `db-${fila.id}`,
      pedidoId: fila.pedidoId,
      servicio: servicioDeEstado(fila.estado),
      estado: fila.estado,
      detalle: fila.detalle,
      ts: fila.createdAt,
    };
  }

  async function refrescarPedidos() {
    const p = await listarPedidos();
    if (Array.isArray(p)) pedidos.value = p;
  }

  async function refrescarInventario() {
    const stock = await obtenerStock();
    if (Array.isArray(stock)) {
      inventario.value = stock.map((s) => ({
        slug: s.insumo,
        stock: s.disponibles,
        total: s.total,
      }));
    }
  }

  async function refrescarFacturas() {
    const cuentas = await listarCuentas();
    if (Array.isArray(cuentas)) facturas.value = cuentas;
  }

  async function cargarTodo() {
    const [p, e] = await Promise.all([listarPedidos(), listarEventos()]);
    pedidos.value = Array.isArray(p) ? p : [];
    eventos.value = Array.isArray(e) ? e.map(mapearEvento) : [];
    await Promise.all([refrescarInventario(), refrescarFacturas()]);
  }

  async function solicitar(input) {
    enviando.value = true;
    errorEnvio.value = "";
    try {
      await apiCrear(input);
      await refrescarPedidos();
    } catch (error) {
      console.error("No se pudo crear el pedido:", error);
      errorEnvio.value =
        "No se pudo enviar el pedido. Verifica que los servicios estén arriba.";
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
            key: `live-${data.pedido_id}-${data.estado}-${data.timestamp}`,
            pedidoId: data.pedido_id,
            servicio: data.servicio,
            estado: data.estado,
            detalle: data.detalle,
            ts: data.timestamp,
          },
          ...eventos.value,
        ].slice(0, 60);

        const idx = pedidos.value.findIndex((p) => p.id === data.pedido_id);
        if (idx >= 0) {
          pedidos.value[idx] = { ...pedidos.value[idx], estado: data.estado };
        }
        refrescarPedidos();

        // Cada paso del flujo altera inventario o contabilidad: refrescamos
        // el panel correspondiente con los datos reales de cada servicio.
        if (["RESERVADO", "PARCIAL", "SIN_STOCK"].includes(data.estado)) {
          refrescarInventario();
        }
        if (data.estado === "COMPLETADO") {
          refrescarInventario();
          refrescarFacturas();
        }
      });
      source.onerror = () => {
        conectado.value = false;
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
    errorEnvio,
    inventario,
    facturas,
    cargarTodo,
    solicitar,
    conectarSSE,
  };
}
