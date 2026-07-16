#!/bin/bash

echo "Eliminando entorno QA (grupo5-qa)..."

kubectl delete -k k8s/overlays/qa
