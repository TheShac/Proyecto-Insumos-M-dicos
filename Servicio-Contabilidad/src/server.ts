import { app } from "./app";
import { env } from "./config/env";
import { producer, consumer } from "./config/kafka";
import { iniciarConsumidores } from "./modules/contabilidad/contabilidad.events";

async function main() {
  await producer.connect();
  await consumer.connect();
  await iniciarConsumidores();

  app.listen(env.PORT, () => {
    console.log(`[S3 Contabilidad] escuchando en http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Fallo al iniciar S3:", err);
  process.exit(1);
});