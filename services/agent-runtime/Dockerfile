FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/agent-runtime/package*.json ./services/agent-runtime/

RUN npm ci

COPY . .

RUN npm run build --workspace=@ajaxai/shared && npm run build --workspace=@ajaxai/agent-runtime

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

CMD ["npm", "run", "start:agent"]
