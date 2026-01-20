FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy built files
COPY --from=builder /app/dist ./dist

# Non-root user for security
USER node

ENV NODE_ENV=production
ENV PORT=8081
ENV HOST=0.0.0.0

EXPOSE 8081

CMD ["node", "dist/index.js"]
