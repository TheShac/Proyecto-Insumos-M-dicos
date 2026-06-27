import { db } from "../config/db";
import { tarifas } from "./schema";

const TARIFAS = [
  { insumo: "tanque_oxigeno", precioUnitario: 85000 },
  { insumo: "suero_fisiologico", precioUnitario: 3500 },
  { insumo: "guantes_caja", precioUnitario: 12000 },
  { insumo: "mascarilla_n95", precioUnitario: 2800 },
  { insumo: "jeringa_10ml", precioUnitario: 600 },
  { insumo: "monitor_signos", precioUnitario: 1200000 },
];

async function seed() {
  await db.delete(tarifas);
  await db.insert(tarifas).values(TARIFAS);
  console.log(`[S3] Seed: ${TARIFAS.length} tarifas`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });