<script setup>
import { ESTADOS, hora } from "../lib/api";

defineProps({ eventos: Array, conectado: Boolean });
</script>

<template>
  <section class="card feed">
    <header class="card-head">
      <div class="feed-title">
        <h2>Cola de eventos</h2>
        <span class="live" :class="{ on: conectado }">
          {{ conectado ? "en vivo" : "reconectando…" }}
        </span>
      </div>
      <p>Bus de mensajes entre los tres servicios: cada paso se publica y lo consume el siguiente.</p>
    </header>

    <p v-if="!eventos.length" class="empty">Sin eventos todavía.</p>

    <ol v-else class="timeline">
      <li v-for="ev in eventos" :key="ev.key" class="evento">
        <span class="dot" :class="ESTADOS[ev.estado].cls" />
        <div class="evento-body">
          <div class="evento-head">
            <span class="svc">{{ ev.servicio }}</span>
            <span class="ts">{{ hora(ev.ts) }}</span>
          </div>
          <p class="detalle">{{ ev.detalle }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>