#!/bin/bash

echo "Verificando herramientas..."

docker --version
kubectl version --client
docker compose version

echo ""
echo "Cluster actual:"
kubectl config current-context

echo ""
echo "Nodes:"
kubectl get nodes