#!/bin/bash

echo "Desplegando Producción..."

kubectl apply -k k8s/production

kubectl get pods -n production