#!/bin/bash

# Logs del servicio de pedidos en QA (usar -n grupo5-prod para producción)
kubectl logs deployment/servicio-gestion-pedido -n grupo5-qa -f
