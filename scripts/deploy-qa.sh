#!/bin/bash

echo "Desplegando entorno QA (grupo5-qa)..."

kubectl apply -k k8s/overlays/qa

echo ""

kubectl get pods -n grupo5-qa

echo ""

kubectl get services -n grupo5-qa
