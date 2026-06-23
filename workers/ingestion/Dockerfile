FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app

FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @intelliforge/db db:generate
RUN pnpm --filter @remoteforge/ingestion-worker build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/workers/ingestion/dist ./dist
COPY --from=builder /app/workers/ingestion/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

CMD ["node", "dist/index.js"]
