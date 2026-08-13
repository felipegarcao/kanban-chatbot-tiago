# syntax=docker/dockerfile:1

# Debian slim (não alpine): argon2 usa binding nativo e o musl da alpine costuma exigir
# recompilar na mão; com glibc os binários pré-compilados do pacote funcionam de primeira.
FROM node:22-bookworm-slim AS base
RUN corepack enable

# ---- deps: só instala dependências, fica em cache enquanto o código muda ----
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder: compila o Next.js ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Valores fake só pra satisfazer a validação de env (Zod) durante o build — o `next build`
# não abre conexão real com o banco, mas o schema exige as chaves presentes. Em runtime o
# container usa as variáveis reais (docker-compose / --env-file), nunca estas.
ENV DATABASE_URL="postgres://build:build@localhost:5432/build"
ENV SESSION_SECRET="build-time-placeholder-00000000000000000000"
ENV N8N_WEBHOOK_FINALIZAR_ATENDIMENTO_URL="https://build.invalid/webhook"
ENV NODE_ENV=production

RUN pnpm build

# ---- runner: só o output standalone, sem devDependencies nem código-fonte ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
