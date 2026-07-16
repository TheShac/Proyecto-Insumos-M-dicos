#!/bin/bash

echo "Desplegando entorno QA..."

kubectl apply -k k8s/qa

echo ""

kubectl get pods -n qa

echo ""

kubectl get services -n qa