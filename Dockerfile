# syntax=docker/dockerfile:1
# Imagem só com dependências. O código entra por volume no Compose,
# então editar fonte não invalida esta camada.
FROM node:24-bookworm-slim

WORKDIR /app

ENV HUSKY=0 \
    NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

COPY package.json package-lock.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/fretou-clients/package.json packages/fretou-clients/package.json
COPY packages/fretou-components/package.json packages/fretou-components/package.json
COPY packages/fretou-trips/package.json packages/fretou-trips/package.json
COPY packages/fretou-users/package.json packages/fretou-users/package.json
COPY packages/fretou-vehicles/package.json packages/fretou-vehicles/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

# O hash entra na camada para ela só mudar junto com o package-lock.
RUN --mount=type=cache,target=/root/.npm \
    npm ci \
 && sha256sum package-lock.json | awk '{print $1}' > node_modules/.lock-hash

CMD ["npm", "run", "dev", "-w", "web", "--", "--hostname", "0.0.0.0"]
