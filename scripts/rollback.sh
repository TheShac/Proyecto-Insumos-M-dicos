#!/bin/bash

kubectl rollout undo deployment/servicio-gestion-pedido -n grupo5-qa
