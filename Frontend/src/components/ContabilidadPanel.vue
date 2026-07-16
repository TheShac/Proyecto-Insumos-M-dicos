<script setup>
import { formatoPesos, nombreInsumo, hora } from "../lib/api";

defineProps({ facturas: Array });

// Cada cuenta llega como {cuentaId, pedidoId, fichaPaciente, costoTotal, createdAt, items[]}
function detalleItems(f) {
  if (!f.items?.length) return "Sin ítems facturables (sin stock)";
  return f.items
    .map((i) => `${i.cantidad}× ${nombreInsumo(i.insumo)}`)
    .join(", ");
}
</script>

<template>
  <section class="card">
    <header class="card-head">
      <span class="svc-tag" style="background-color: var(--st-completado)"
        >Servicio 3</span
      >
      <h2>Cierres Financieros - Contabilidad</h2>
      <p>
        Procesos administrativos ejecutados automáticamente a nivel de
        ledger/libro contable sin intervención humana.
      </p>
    </header>

    <p v-if="!facturas.length" class="empty">
      Esperando eventos de liquidación contable...
    </p>

    <div v-else class="table-container">
      <table class="tabla-contable">
        <thead>
          <tr>
            <th>Folio / Ficha</th>
            <th>Detalle Insumo</th>
            <th>Costo Cargado</th>
            <th>Hora Cierre</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in facturas" :key="f.cuentaId" class="fila-factura">
            <td>
              <div class="badge-ficha">{{ f.cuentaId }}</div>
              <div class="ficha-secundaria">{{ f.fichaPaciente ?? "sin ficha" }}</div>
            </td>
            <td class="text-insumo">{{ detalleItems(f) }}</td>
            <td class="monto-total">{{ formatoPesos(f.costoTotal) }}</td>
            <td class="hora-registro">{{ hora(f.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
  margin-top: 10px;
}
.tabla-contable {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}
.tabla-contable th {
  color: var(--muted);
  font-weight: 600;
  padding: 10px;
  border-bottom: 2px solid var(--border);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 1px;
}
.tabla-contable td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--border);
}
.badge-ficha {
  font-family: var(--mono);
  background: rgba(63, 206, 143, 0.1);
  color: var(--st-completado);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
  font-weight: bold;
}
.ficha-secundaria {
  font-family: var(--mono);
  font-size: 0.75rem;
  color: var(--muted);
  margin-top: 4px;
}
.text-insumo {
  color: var(--text);
  font-weight: 500;
}
.monto-total {
  font-family: var(--mono);
  color: #fff;
  font-weight: 600;
}
.hora-registro {
  color: var(--faint);
  font-family: var(--mono);
}
.fila-factura {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
