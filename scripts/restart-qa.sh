#!/bin/bash

echo "Reiniciando Deployments QA..."

kubectl rollout restart deployment --all -n qa