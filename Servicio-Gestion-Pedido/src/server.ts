import { app } from "./app";
import { env } from "./config/env";
import { producer, consumer, asegurarTopics } from "./config/kafka";
import { TOPICS } from "./modules/pedidos/pedidos.contracts";
import { iniciarConsumidores } from "./modules/pedidos/pedidos.events";

async function main() {
  await asegurarTopics(Object.values(TOPICS));
  await producer.connect();
  await consumer.connect();
  await iniciarConsumidores();

  app.listen(env.PORT, () => {
    console.log(`[S1 Pedidos] escuchando en http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error("Fallo al iniciar S1:", err);
  process.exit(1);
});