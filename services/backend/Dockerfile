FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY services/backend/package*.json ./services/backend/

RUN npm ci

COPY . .

RUN npm run build --workspace=@ajaxai/shared && npm run build --workspace=@ajaxai/backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 3001
CMD ["npm", "run", "start:backend"]
