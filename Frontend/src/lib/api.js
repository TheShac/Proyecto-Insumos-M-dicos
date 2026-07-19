const BASE = "/api";

// Helpers fetch seguros contra caídas del servidor
async function getJSON(path) {
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(
      `Servidor offline en ${path}. Usando datos vacíos para simulación.`,
    );
    return []; // Retorna un array vacío en lugar de romper la app
  }
}

async function postJSON(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

// Catálogo de insumos oficiales del Grupo 5
export const CATALOGO = [
  { slug: "tanque_oxigeno", nombre: "Tanque de Oxígeno" },
  { slug: "suero_fisiologico", nombre: "Suero Fisiológico 500ml" },
  { slug: "guantes_caja", nombre: "Caja de Guantes Estériles" },
  { slug: "mascarilla_n95", nombre: "Mascarilla N95" },
  { slug: "jeringa_10ml", nombre: "Jeringa 10ml" },
  { slug: "monitor_signos", nombre: "Monitor de Signos Vitales" },
];

export function nombreInsumo(slug) {
  const insumo = CATALOGO.find((c) => c.slug === slug);
  return insumo ? insumo.nombre : slug;
}

// Mapa de estados con el significado clínico de la rúbrica
export const ESTADOS = {
  RECIBIDO: { label: "Recibido", cls: "recibido" },
  BUSCANDO_STOCK: { label: "Buscando stock", cls: "buscando" },
  RESERVADO: { label: "Reservado", cls: "reservado" },
  PARCIAL: { label: "Parcial", cls: "parcial" },
  SIN_STOCK: { label: "Sin stock", cls: "sinstock" },
  COMPLETADO: { label: "Facturado", cls: "completado" },
};

// Acceso seguro: un estado desconocido no debe romper el render.
export function estadoInfo(estado) {
  return ESTADOS[estado] ?? { label: estado, cls: "recibido" };
}

// ¡Cambiado para reflejar fielmente tus diapositivas!
export function servicioDeEstado(estado) {
  if (estado === "RECIBIDO" || estado === "BUSCANDO_STOCK")
    return "Sistema Médico";
  if (estado === "RESERVADO" || estado === "PARCIAL" || estado === "SIN_STOCK")
    return "Bodega Inteligente";
  return "Contabilidad Médica";
}

export const formatoPesos = (n) => "$" + Number(n).toLocaleString("es-CL");

export const hora = (iso) => {
  if (!iso) return "Ahora";
  return new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export function listarPedidos() {
  return getJSON("/pedidos");
}
export function listarEventos() {
  return getJSON("/eventos");
}
export function crearPedido(body) {
  return postJSON("/pedidos", body);
}
export function obtenerStock() {
  return getJSON("/inventario/stock");
}
export function listarCuentas() {
  return getJSON("/contabilidad/cuentas");
}
