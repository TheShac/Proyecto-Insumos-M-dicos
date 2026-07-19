# Sistema de Monitoreo de Insumos Médicos

## Descripción del Proyecto
Plataforma distribuida desarrollada para gestionar la trazabilidad, reserva y valorización de insumos médicos hospitalarios. El sistema implementa una arquitectura de microservicios orientada a eventos, lo que permite un procesamiento asíncrono y resiliente, evitando el acoplamiento directo entre los dominios de negocio.

## Arquitectura y Tecnologías Implementadas

El ecosistema se divide en componentes independientes comunicados a través de un bus de eventos (Apache Kafka):

- **Cliente (Frontend):** Aplicación de página única (SPA) desarrollada con Vue.js y Vite.
- **API Gateway:** Implementado con NGINX actuando como proxy inverso para centralizar el enrutamiento y proteger la red interna.
- **Microservicios Backend (Node.js y TypeScript):**
  - `Servicio-Gestion-Pedido`: Administra el ciclo de vida de las solicitudes médicas.
  - `Servicio-Inventario`: Valida el stock físico y gestiona las reservas.
  - `Servicio-Contabilidad`: Calcula costos y emite las cuentas asociadas a cada ficha médica.
- **Persistencia y ORM:** Se aplica el patrón *Database-per-Service* utilizando PostgreSQL. La interacción con la base de datos se realiza mediante **Drizzle ORM** para asegurar el tipado estricto y la gestión de migraciones.
- **Gestión de Dependencias:** El proyecto utiliza `pnpm` configurado mediante `pnpm-workspace.yaml` para administrar el entorno de monorepo.

## Estructura del Repositorio

El código fuente separa estrictamente la lógica de aplicación de la configuración de infraestructura:

- `.github/workflows/`: Definición de pipelines de CI/CD independientes para cada servicio.
- `Api-gateway/`, `Frontend/`, `Servicio-*/`: Código fuente de los servicios aislados.
- `k8s/`: Manifiestos de Kubernetes utilizando Kustomize (`base`, `overlays/qa`, `overlays/prod`) para la gestión de múltiples entornos.
- `scripts/`: Herramientas bash para automatización de despliegue y mantenimiento local.

## Instrucciones de Despliegue Local

Para levantar la infraestructura de desarrollo en una máquina local, es necesario contar con Docker y Docker Compose instalados.

1. **Configuración de variables de entorno:**
   Copie el archivo de ejemplo en la raíz del proyecto para generar sus credenciales locales:
   ```bash
   cp .env.example .env
