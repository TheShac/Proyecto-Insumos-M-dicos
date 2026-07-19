<script setup>
import { reactive, ref, computed } from "vue";
import { CATALOGO } from "../lib/api";

defineProps({ enviando: Boolean, errorEnvio: String });
const emit = defineEmits(["solicitar"]);

// ─── Formatos exigidos ───
const PABELLON_REGEX = /^UCI-\d+$/i;
const FICHA_REGEX = /^PAC-\d{4}$/i;
const ENFERMERO_REGEX = /^[A-ZÁÉÍÓÚÑ]\.\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/;

const datosComunes = reactive({
  enfermeroId: "",
  pabellon: "",
  fichaPaciente: "",
});

function itemVacio() {
  return { insumo: "", cantidad: 1 };
}

const items = ref([itemVacio()]);
const confirmacion = ref("");

function agregarItem() {
  items.value.push(itemVacio());
}

function quitarItem(index) {
  if (items.value.length === 1) return;
  items.value.splice(index, 1);
}

const enfermeroValido = computed(() =>
  ENFERMERO_REGEX.test(datosComunes.enfermeroId.trim()),
);
const pabellonValido = computed(() =>
  PABELLON_REGEX.test(datosComunes.pabellon.trim()),
);
// La ficha es opcional: vacía también cuenta como válida.
const fichaValida = computed(() => {
  const v = datosComunes.fichaPaciente.trim();
  return v === "" || FICHA_REGEX.test(v);
});

const formValido = computed(() => {
  if (!enfermeroValido.value) return false;
  if (!pabellonValido.value) return false;
  if (!fichaValida.value) return false;
  return items.value.every((it) => it.insumo && it.cantidad >= 1);
});

function enviar() {
  if (!formValido.value) return;

  // Un solo POST con el contrato que exige el Servicio de Pedidos:
  // { nombre_enfermero, pabellon, ficha_paciente?, items: [{insumo, cantidad}] }
  emit("solicitar", {
    nombre_enfermero: datosComunes.enfermeroId.trim(),
    pabellon: datosComunes.pabellon.trim().toUpperCase(),
    ficha_paciente: datosComunes.fichaPaciente.trim() || undefined,
    items: items.value.map((it) => ({
      insumo: it.insumo,
      cantidad: Number(it.cantidad),
    })),
  });

  confirmacion.value = `Pedido enviado (${items.value.length} insumo${
    items.value.length > 1 ? "s" : ""
  }). Búsqueda en bodegas iniciada.`;
  items.value = [itemVacio()];
  datosComunes.fichaPaciente = "";
}
</script>

<template>
  <section class="card form">
    <header class="card-head">
      <span class="svc-tag">Servicio 1</span>
      <h2>Solicitar insumo</h2>
      <p>
        Los enfermeros piden insumos vía REST. El sistema confirma la recepción
        e inicia la búsqueda automática.
      </p>
    </header>

    <div class="grid">
      <label
        class="field"
        :class="{ invalid: datosComunes.enfermeroId && !enfermeroValido }"
      >
        <span>Enfermero/a</span>
        <input v-model="datosComunes.enfermeroId" placeholder="Ej. M. Rojas" />
        <small
          v-if="datosComunes.enfermeroId && !enfermeroValido"
          class="error-msg"
        >
          Formato: inicial en mayúscula, punto, espacio y apellido. Ej: M. Rojas
        </small>
      </label>

      <label
        class="field"
        :class="{ invalid: datosComunes.pabellon && !pabellonValido }"
      >
        <span>Pabellón / Unidad</span>
        <input v-model="datosComunes.pabellon" placeholder="Ej. UCI-3" />
        <small
          v-if="datosComunes.pabellon && !pabellonValido"
          class="error-msg"
        >
          Formato: UCI-(número). Ej: UCI-3
        </small>
      </label>

      <label
        class="field"
        :class="{ invalid: datosComunes.fichaPaciente && !fichaValida }"
      >
        <span>Paciente / Ficha <em>(opcional)</em></span>
        <input
          v-model="datosComunes.fichaPaciente"
          placeholder="Ej. PAC-1048"
        />
        <small
          v-if="datosComunes.fichaPaciente && !fichaValida"
          class="error-msg"
        >
          Formato: PAC- seguido de 4 números. Ej: PAC-1048
        </small>
      </label>
    </div>

    <div class="items-tabla">
      <table>
        <thead>
          <tr>
            <th>Insumo</th>
            <th>Cant.</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items" :key="index">
            <td>
              <select v-model="item.insumo">
                <option value="" disabled>Selecciona un insumo</option>
                <option v-for="c in CATALOGO" :key="c.slug" :value="c.slug">
                  {{ c.nombre }}
                </option>
              </select>
            </td>
            <td>
              <input
                type="number"
                min="1"
                v-model.number="item.cantidad"
                class="cantidad-input"
              />
            </td>
            <td class="col-accion">
              <button
                type="button"
                class="quitar-item"
                :disabled="items.length === 1"
                @click="quitarItem(index)"
                aria-label="Quitar insumo"
              >
                ✕
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="anadir-item" @click="agregarItem">
        + Añadir insumo
      </button>
    </div>

    <p v-if="errorEnvio" class="error-msg">{{ errorEnvio }}</p>
    <p v-else-if="confirmacion" class="confirm">{{ confirmacion }}</p>
    <p v-else-if="!formValido" class="hint">
      Completa enfermero, pabellón (formato UCI-#) y elige un insumo en cada
      fila para habilitar el envío.
    </p>

    <button
      class="solicitar"
      :disabled="enviando || !formValido"
      @click="enviar"
    >
      {{ enviando ? "Enviando…" : "Solicitar insumo" }}
    </button>
  </section>
</template>
