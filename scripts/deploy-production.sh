#!/bin/bash

echo "Desplegando Producción (grupo5-prod)..."

kubectl apply -k k8s/overlays/prod

kubectl get pods -n grupo5-prod
