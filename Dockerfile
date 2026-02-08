# Multi-stage build for Teacher-Buddy
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm ci for reproducible builds
RUN npm ci --include=dev

# Copy the entire project (including attached_assets)
COPY . .

# Build the project (client and server)
RUN npm run build

# Prune devDependencies to keep the image small and speed up the second stage
RUN npm prune --production

# Verify build output exists
RUN test -f dist/index.cjs || (echo "Build failed: dist/index.cjs not found" && exit 1)

# Stage 2: Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Copy package files and node_modules from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.cjs"]
