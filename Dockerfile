FROM node:22.22.1-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY docs/package.json docs/package.json
COPY __tests__/base/package.json __tests__/base/package.json
COPY __tests__/e2e/package.json __tests__/e2e/package.json
COPY __tests__/init/package.json __tests__/init/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 5173

CMD ["pnpm", "--filter", "docs", "dev", "--host", "0.0.0.0"]
