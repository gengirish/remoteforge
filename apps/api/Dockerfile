FROM node:22-slim AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/affiliate-links/package.json ./packages/affiliate-links/
COPY packages/ingestion/package.json ./packages/ingestion/
COPY packages/job-alerts/package.json ./packages/job-alerts/
COPY packages/api-core/package.json ./packages/api-core/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile --filter api... --ignore-scripts

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY packages ./packages
COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN pnpm --filter @intelliforge/db exec prisma generate --schema=../../packages/db/prisma/schema.prisma
EXPOSE 8080
CMD ["pnpm", "start"]
