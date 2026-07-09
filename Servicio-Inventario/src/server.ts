import { app } from "./app";
import { env } from "./config/env";
import { producer, consumer } from "./config/kafka";
import { iniciarConsumidores } from "./modules/inventario/inventario.events";

async function main() {
  await producer.connect();
  await consumer.connect();
  await iniciarConsumidores();

  app.listen(env.PORT, () => {
    console.log(`[S2 Inventario] escuchando en http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Fallo al iniciar S2:", err);
  process.exit(1);
});