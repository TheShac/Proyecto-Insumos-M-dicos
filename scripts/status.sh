#!/bin/bash

echo "Namespaces"

kubectl get ns

echo ""

echo "Pods"

kubectl get pods -A

echo ""

echo "Services"

kubectl get svc -A