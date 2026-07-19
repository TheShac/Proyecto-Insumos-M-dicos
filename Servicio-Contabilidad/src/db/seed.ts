import { db } from "../config/db";
import { tarifas } from "./schema";

const TARIFAS = [
  { insumo: "tanque_oxigeno",    precioUnitario: 85000 },
  { insumo: "suero_fisiologico", precioUnitario: 3500 },
  { insumo: "guantes_caja",      precioUnitario: 12000 },
  { insumo: "mascarilla_n95",    precioUnitario: 2800 },
  { insumo: "jeringa_10ml",      precioUnitario: 600 },
  { insumo: "monitor_signos",    precioUnitario: 1200000 },
];

async function seed() {
  const yaHayDatos = await db
    .select({ insumo: tarifas.insumo })
    .from(tarifas)
    .limit(1);

  if (yaHayDatos.length > 0) {
    console.log("[S3] La tabla 'tarifas' ya tiene datos; se omite el seed.");
    process.exit(0);
  }

  await db.insert(tarifas).values(TARIFAS).onConflictDoNothing();

  console.log("[S3] Seed completado:");
  for (const t of TARIFAS) {
    console.log(`  ${t.insumo.padEnd(22)} $${t.precioUnitario.toLocaleString("es-CL")}/unidad`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("[S3] Error en seed:", err);
  process.exit(1);
});