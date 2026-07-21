# Frontend — Sistema de Monitoreo de Insumos Médicos

SPA desarrollada con **Vue 3 + Vite** (Tailwind CSS 4). Muestra el dashboard de pedidos, stock de bodega, cuentas de contabilidad y el feed de eventos en tiempo real (SSE). Todas las llamadas a backend salen por `/api` y las enruta el API Gateway (NGINX).

> Este paquete usa **npm** (`package-lock.json`), a diferencia de los microservicios que usan pnpm.

## Requisitos

- Node.js ≥ 18

## Configuración del proyecto

```sh
npm install
```

### Desarrollo con hot-reload

```sh
npm run dev
```

El proxy de desarrollo (ver `vite.config.js`) redirige `/api` hacia `API_PROXY_TARGET` (por defecto `http://api-gateway`, el gateway del stack de Docker Compose / Kubernetes).

### Build de producción

```sh
npm run build
```

## IDE recomendado

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (deshabilitar Vetur).
