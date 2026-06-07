# === STAGE 1: Build ===
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
RUN npm ci

# Copy source files and build the production application
COPY . .
RUN npm run build

# === STAGE 2: Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a secure non-root user for Next.js
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy only the compiled deployment build from Stage 1
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]