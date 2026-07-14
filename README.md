#Sistema de Monitoreo de Insumos Médicos

Una plataforma distribuida para la trazabilidad y gestión de insumos médicos hospitalarios. Este sistema permite a los profesionales de la salud solicitar insumos, reservar stock y emitir cobros de manera asíncrona, garantizando la resiliencia y escalabilidad de las operaciones.

##Arquitectura del Sistema

El proyecto está construido bajo una **Arquitectura de Microservicios Orientada a Eventos**:

- **Frontend:** Interfaz de usuario desarrollada en Vue.js.
- **API Gateway:** NGINX actuando como proxy inverso y enrutador central.
- **Microservicios (Node.js / TypeScript):**
  - `Servicio-Pedido`: Gestiona la creación y estado de las solicitudes.
  - `Servicio-Inventario`: Valida existencias y reserva unidades físicas.
  - `Servicio-Contabilidad`: Calcula costos y emite las cuentas.
- **Bus de Eventos:** Apache Kafka orquesta la comunicación asíncrona entre servicios (eventos como `PEDIDO_CREADO` o `STOCK_RESERVADO`).
- **Bases de Datos:** Patrón *Database-per-service* utilizando PostgreSQL para asegurar el aislamiento de datos.

##Despliegue Local

Para levantar el ecosistema completo en tu máquina local:

1. Clona este repositorio.
2. Asegúrate de tener Docker y Docker Compose instalados.
3. Ejecuta el siguiente comando en la raíz del proyecto:
   ```bash
   docker compose up --build

