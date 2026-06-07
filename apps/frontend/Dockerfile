FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
ARG NEXT_PUBLIC_WS_BASE=ws://localhost:8000/api/ws
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NEXT_PUBLIC_WS_BASE=${NEXT_PUBLIC_WS_BASE}

RUN npm run build --workspace=@ajaxai/shared && npm run build --workspace=@ajaxai/frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 3000
CMD ["npm", "run", "start:frontend"]
