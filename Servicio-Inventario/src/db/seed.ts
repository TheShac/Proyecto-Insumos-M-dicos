import { db } from "../config/db";
import { unidadesInsumo } from "./schema";

async function seed() {
  const unidades = Array.from({ length: 10 }, (_, i) => ({
    serial: `SN-${String(i + 1).padStart(3, "0")}`,
    insumo: "tanque_oxigeno",
    bodegaId: "BOD-CENTRAL",
    estado: "DISPONIBLE" as const,
  }));

  await db.insert(unidadesInsumo).values(unidades);
  console.log(`[S2] Seed: ${unidades.length} unidades cargadas`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});