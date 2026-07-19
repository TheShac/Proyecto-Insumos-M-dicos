#!/bin/bash

echo "Reiniciando aplicaciones de QA (sin tocar BDs ni Kafka)..."

kubectl rollout restart -n grupo5-qa \
  deployment/servicio-gestion-pedido \
  deployment/servicio-inventario \
  deployment/servicio-contabilidad \
  deployment/frontend \
  deployment/api-gateway
