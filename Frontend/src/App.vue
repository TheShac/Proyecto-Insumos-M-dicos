<script setup>
import { onMounted } from "vue";
import { useDashboard } from "./composables/useDashboard";
import SolicitudForm from "./components/SolicitudForm.vue";
import PedidosPanel from "./components/PedidosPanel.vue";
import EventoFeed from "./components/EventoFeed.vue";
import InventarioPanel from "./components/InventarioPanel.vue";
import ContabilidadPanel from "./components/ContabilidadPanel.vue";

const {
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
} = useDashboard();

onMounted(() => {
  cargarTodo();
  conectarSSE();
});
</script>

<template>
  <div class="app">
    <header class="topbar">
      <div class="brand">
        <span class="pulse" :class="{ on: conectado }" />
        <div>
          <h1>Control de Gestión Hospitalaria (G5)</h1>
          <p>
            Ecosistema Distribuido de Insumos Médicos · Event-Driven
            Architecture (Kafka)
          </p>
        </div>
      </div>
    </header>

    <main class="layout">
      <!-- Fila 1: Formulario 40% + Inventario 60% -->
      <div class="fila-superior">
        <SolicitudForm
          :enviando="enviando"
          :error-envio="errorEnvio"
          @solicitar="solicitar"
        />
        <InventarioPanel :inventario="inventario" />
      </div>

      <!-- Fila 2: Facturación (izq) + Pedidos (der), 50/50 -->
      <div class="fila-media">
        <ContabilidadPanel :facturas="facturas" />
        <PedidosPanel :pedidos="pedidos" />
      </div>

      <!-- Fila 3: Eventos, ancho completo -->
      <EventoFeed :eventos="eventos" :conectado="conectado" />
    </main>
  </div>
</template>

<style>
/* Fila superior: Formulario 40% / Inventario 60% (5/12 y 7/12, igual que el prototipo) */
.fila-superior {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 16px;
}

/* Fila media: Facturación / Pedidos, 50% cada uno */
.fila-media {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1100px) {
  .fila-superior,
  .fila-media {
    grid-template-columns: 1fr;
  }
}
</style>
