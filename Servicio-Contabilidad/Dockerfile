FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

COPY package.json ./
RUN pnpm install --no-frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
#COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3003

CMD ["node", "dist/server.js"]