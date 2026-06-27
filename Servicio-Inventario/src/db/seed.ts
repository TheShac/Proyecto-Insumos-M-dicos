import { db } from "../config/db";
import { unidadesInsumo } from "./schema";

const CATALOGO = [
  { insumo: "tanque_oxigeno", stock: 6 },
  { insumo: "suero_fisiologico", stock: 40 },
  { insumo: "guantes_caja", stock: 25 },
  { insumo: "mascarilla_n95", stock: 0 },
  { insumo: "jeringa_10ml", stock: 120 },
  { insumo: "monitor_signos", stock: 2 },
];

async function seed() {
  await db.delete(unidadesInsumo);

  const filas = CATALOGO.flatMap(({ insumo, stock }) =>
    Array.from({ length: stock }, (_, i) => ({
      serial: `${insumo.toUpperCase().slice(0, 3)}-${String(i + 1).padStart(3, "0")}`,
      insumo,
      bodegaId: "BOD-CENTRAL",
      estado: "DISPONIBLE" as const,
    }))
  );

  if (filas.length) await db.insert(unidadesInsumo).values(filas);
  console.log(`[S2] Seed: ${filas.length} unidades en ${CATALOGO.length} insumos`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });