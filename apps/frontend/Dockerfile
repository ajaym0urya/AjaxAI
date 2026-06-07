FROM node:20-alpine AS build
WORKDIR /app

# Copy root package files
COPY package*.json ./
# Copy frontend package files
COPY apps/frontend/package*.json ./apps/frontend/

# Install dependencies
RUN npm ci

# Copy full source
COPY . .

# Build args for Next.js to inject env vars at build time
ARG NEXT_PUBLIC_API_BASE=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}

# Build the Next.js app
RUN npm run build --workspace=apps/frontend

# Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# We only copy the built frontend and root node_modules if needed
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/frontend ./apps/frontend
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start:frontend"]
