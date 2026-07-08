import { Kafka, Partitioners } from "kafkajs";
import { env } from "./env";

export const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: env.KAFKA_BROKERS.split(","),
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
export const consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });

export async function asegurarTopics(topics: string[]) {
  const admin = kafka.admin();
  await admin.connect();
  await admin.createTopics({
    topics: topics.map((topic) => ({ topic, numPartitions: 1, replicationFactor: 1 })),
  });
  await admin.disconnect();
}