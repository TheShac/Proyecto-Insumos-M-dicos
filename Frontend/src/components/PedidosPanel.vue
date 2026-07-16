<script setup>
import { estadoInfo, nombreInsumo, formatoPesos, hora } from "../lib/api";

defineProps({ pedidos: Array });

// El backend entrega cada pedido con su lista de items:
// {id, nombreEnfermero, pabellon, fichaPaciente, estado, costoTotal, createdAt, items[]}
function resumenItems(p) {
  if (!p.items?.length) return p.id;
  return p.items
    .map((i) => `${i.cantidad}× ${nombreInsumo(i.insumo)}`)
    .join(", ");
}
</script>

<template>
  <section class="card">
    <header class="card-head">
      <h2>Pedidos en curso</h2>
      <p>Seguimiento del estado de cada pedido a través de los tres servicios.</p>
    </header>

    <p v-if="!pedidos.length" class="empty">
      Aún no hay pedidos. Solicita un insumo para iniciar el flujo.
    </p>

    <ul v-else class="lista">
      <li v-for="p in pedidos" :key="p.id" class="pedido">
        <div class="pedido-main">
          <strong>{{ resumenItems(p) }}</strong>
          <span class="meta">
            {{ p.pabellon }} · {{ p.fichaPaciente ?? "sin ficha" }} · Enf. {{ p.nombreEnfermero }}
            · {{ hora(p.createdAt) }}
          </span>
        </div>
        <div class="pedido-side">
          <span v-if="p.costoTotal" class="costo">{{ formatoPesos(p.costoTotal) }}</span>
          <span class="badge" :class="estadoInfo(p.estado).cls">{{ estadoInfo(p.estado).label }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>
