import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import "dotenv/config";

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool);

  console.log("[S2] Aplicando migraciones...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[S2] Migraciones aplicadas correctamente.");

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("[S2] Error en migración:", err);
  process.exit(1);
});