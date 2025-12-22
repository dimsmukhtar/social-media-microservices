FROM node:20-slim

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3002

CMD ["pnpm", "start"]