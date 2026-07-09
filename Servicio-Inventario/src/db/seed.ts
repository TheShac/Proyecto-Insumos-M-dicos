import { db } from "../config/db";
import { unidadesInsumo } from "./schema";

const CATALOGO = [
  { insumo: "tanque_oxigeno",    prefijo: "OXI", stock: 6 },
  { insumo: "suero_fisiologico", prefijo: "SF",  stock: 40 },
  { insumo: "guantes_caja",      prefijo: "G",   stock: 25 },
  { insumo: "mascarilla_n95",    prefijo: "M",   stock: 0 },
  { insumo: "jeringa_10ml",      prefijo: "J",   stock: 120 },
  { insumo: "monitor_signos",    prefijo: "MS",  stock: 2 },
];

async function seed() {
  await db.delete(unidadesInsumo);

  const filas = CATALOGO.flatMap(({ insumo, prefijo, stock }) =>
    Array.from({ length: stock }, (_, i) => ({
      serial: `${prefijo}-${String(i + 1).padStart(2, "0")}`,
      insumo,
      bodegaId: "BOD-CENTRAL",
      estado: "DISPONIBLE" as const,
    }))
  );

  if (filas.length > 0) {
    await db.insert(unidadesInsumo).values(filas);
  }

  console.log(`[S2] Seed completado:`);
  for (const { insumo, prefijo, stock } of CATALOGO) {
    const rango = stock > 0 ? `${prefijo}-01 … ${prefijo}-${String(stock).padStart(2, "0")}` : "sin unidades";
    console.log(`  ${insumo.padEnd(22)} ${String(stock).padStart(3)} unidades  ${rango}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("[S2] Error en seed:", err);
  process.exit(1);
});