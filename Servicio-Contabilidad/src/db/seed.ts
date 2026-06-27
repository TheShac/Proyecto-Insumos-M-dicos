import { db } from "../config/db";
import { tarifas } from "./schema";

async function seed() {
  await db.insert(tarifas).values([
    { insumo: "tanque_oxigeno", precioUnitario: 45000 },
    { insumo: "mascarilla", precioUnitario: 1500 },
    { insumo: "guantes_caja", precioUnitario: 8000 },
  ]);
  console.log("[S3] Seed: tarifas cargadas");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});