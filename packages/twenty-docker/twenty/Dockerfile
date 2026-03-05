# ============================================================
# Uprising CRM — Multi-stage Dockerfile
# ============================================================
# Stage 1 (common-deps): Install all JS deps using Yarn Berry
#   — layer is cached as long as package.json / yarn.lock unchanged
# Stage 2 (twenty-server-build): Compile backend, prune to prod deps
# Stage 3 (twenty-front-build): Vite build of the React frontend
# Stage 4 (twenty): Minimal Alpine runtime image
# ============================================================

# ── Stage 1: Shared dependency installation ─────────────────
FROM node:24-alpine AS common-deps

WORKDIR /app

# Native build tools (node-gyp, canvas) — installed once, cached
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev

# Copy ONLY manifests first — Docker cache is invalidated only when
# these files change, not when source files change.
COPY package.json yarn.lock .yarnrc.yml tsconfig.base.json nx.json ./
COPY .yarn/releases ./.yarn/releases
COPY .yarn/patches  ./.yarn/patches

COPY packages/twenty-emails/package.json       ./packages/twenty-emails/
COPY packages/twenty-server/package.json       ./packages/twenty-server/
COPY packages/twenty-server/patches            ./packages/twenty-server/patches
COPY packages/twenty-ui/package.json           ./packages/twenty-ui/
COPY packages/twenty-shared/package.json       ./packages/twenty-shared/
COPY packages/twenty-front/package.json        ./packages/twenty-front/
COPY packages/twenty-sdk/package.json          ./packages/twenty-sdk/

# Install dependencies — Yarn Berry disk cache preserved across builds
# via BuildKit cache mounts so subsequent installs are near-instant.
# Adding YARN_ENABLE_HARDENED_MODE=0 and --immutable to prevent the
# "unexpected empty event loop" bug in Yarn 4 during CI/Docker builds.
RUN --mount=type=cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,target=/root/.cache \
    YARN_ENABLE_HARDENED_MODE=0 YARN_HTTP_TIMEOUT=100000 yarn install --immutable && npx nx reset


# ── Stage 2: Backend build ───────────────────────────────────
FROM common-deps AS twenty-server-build

# Source copied AFTER deps — only invalidates this layer, not Stage 1
COPY packages/twenty-emails  ./packages/twenty-emails
COPY packages/twenty-shared  ./packages/twenty-shared
COPY packages/twenty-server  ./packages/twenty-server

RUN npx nx run twenty-server:build

# Prune to production-only node_modules to keep the final image lean
RUN yarn workspaces focus --production twenty-emails twenty-shared twenty-server


# ── Stage 3: Frontend build ──────────────────────────────────
FROM common-deps AS twenty-front-build

ARG REACT_APP_SERVER_BASE_URL

COPY packages/twenty-front  ./packages/twenty-front
COPY packages/twenty-ui     ./packages/twenty-ui
COPY packages/twenty-shared ./packages/twenty-shared
COPY packages/twenty-sdk    ./packages/twenty-sdk

# Generate remote-DOM elements needed by twenty-sdk
RUN npx tsx -r tsconfig-paths/register \
    packages/twenty-sdk/scripts/remote-dom/generate-remote-dom-elements.ts

RUN npx nx build twenty-front


# ── Stage 4: Minimal runtime image ──────────────────────────
FROM node:24-alpine AS twenty

# Tooling: curl+jq for healthcheck, psql for DB commands, tsx for scripts
# Consolidated into a single RUN to reduce image layers
RUN apk add --no-cache curl jq postgresql-client && \
    npm install -g tsx

COPY packages/twenty-docker/twenty/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

WORKDIR /app/packages/twenty-server

ARG REACT_APP_SERVER_BASE_URL
ENV REACT_APP_SERVER_BASE_URL=$REACT_APP_SERVER_BASE_URL

ARG APP_VERSION
ENV APP_VERSION=$APP_VERSION

# Copy production artefacts from build stages
# (single COPY from twenty-server-build — avoids redundant layer)
COPY --chown=1000 --from=twenty-server-build /app /app
COPY --chown=1000 --from=twenty-front-build  \
     /app/packages/twenty-front/build        \
     /app/packages/twenty-server/dist/front

LABEL org.opencontainers.image.source=https://github.com/Endsi3g/Uprising-Notion-but-better-
LABEL org.opencontainers.image.description="Uprising Studio CRM — custom fork of Twenty CRM with prospecting, voice-agency, and Instagram integrations."

RUN mkdir -p /app/.local-storage /app/packages/twenty-server/.local-storage && \
    chown -R 1000:1000 /app

USER 1000

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "dist/main"]
