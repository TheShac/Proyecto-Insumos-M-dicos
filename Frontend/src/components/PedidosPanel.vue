<script setup>
import { ESTADOS, nombreInsumo, formatoPesos, hora } from "../lib/api";

defineProps({ pedidos: Array });
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
          <strong>{{ p.cantidad }}× {{ nombreInsumo(p.insumo) }}</strong>
          <span class="meta">
            {{ p.pabellon }} · {{ p.fichaPaciente ?? "sin ficha" }} · Enf. {{ p.enfermeroId }}
            · {{ hora(p.createdAt) }}
          </span>
        </div>
        <div class="pedido-side">
          <span v-if="p.costoTotal" class="costo">{{ formatoPesos(p.costoTotal) }}</span>
          <span class="badge" :class="ESTADOS[p.estado].cls">{{ ESTADOS[p.estado].label }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>