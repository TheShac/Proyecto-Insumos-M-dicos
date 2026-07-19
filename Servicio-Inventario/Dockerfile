FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --no-frozen-lockfile --prod --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3002

# Aplica migraciones, siembra datos iniciales (idempotente) y levanta el servidor
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js && node dist/server.js"]