<script setup>
import { nombreInsumo } from "../lib/api";

defineProps({ inventario: Array });
</script>

<template>
  <section class="card">
    <header class="card-head">
      <span
        class="svc-tag"
        style="background-color: var(--st-reservado); color: white"
        >Servicio 2</span
      >
      <h2>Stock - Bodega Inteligente</h2>
      <p>
        Inventario físico real del servicio de bodega: el stock disminuye de
        forma atómica cuando el servicio procesa el evento de Kafka.
      </p>
    </header>

    <p v-if="!inventario.length" class="empty">
      Sin datos de bodega. Verifica que el servicio de inventario esté arriba.
    </p>

    <div v-else class="inventario-grid">
      <div v-for="item in inventario" :key="item.slug" class="inventario-item">
        <div class="item-info">
          <span class="item-name">{{ nombreInsumo(item.slug) }}</span>
          <span class="item-stock" :class="{ 'low-stock': item.stock <= 3 }">
            {{ item.stock }} un.
          </span>
        </div>
        <div class="progress-bar-bg">
          <div
            class="progress-bar-fill"
            :style="{ width: Math.min((item.stock / (item.total || 15)) * 100, 100) + '%' }"
            :class="{ 'low-bar': item.stock <= 3 }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.inventario-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 10px;
}
.inventario-item {
  background: var(--surface-2);
  padding: 12px;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}
.item-stock {
  font-family: var(--mono);
  font-size: 0.85rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--accent);
}
.item-stock.low-stock {
  color: var(--st-sinstock);
  background: rgba(244, 113, 110, 0.1);
  font-weight: bold;
}
.progress-bar-bg {
  background: var(--border);
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}
.progress-bar-fill {
  background: var(--accent);
  height: 100%;
  transition: width 0.4s ease;
}
.progress-bar-fill.low-bar {
  background: var(--st-sinstock);
}
</style>
