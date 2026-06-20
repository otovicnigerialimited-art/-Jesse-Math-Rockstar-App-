# Use modern Node LTS runtime as builder
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency configs
COPY package*.json ./

# Install all dependencies (including devDependencies for compiling)
RUN npm ci

# Copy all source files
COPY . .

# Build the frontend assets and compile/bundle server.ts to dist/server.cjs
RUN npm run build

# Second stage: Lightweight production runtime
FROM node:20-alpine

WORKDIR /usr/src/app

# Set container environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy package configurations
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built artifacts from builder stage (statics and server.cjs)
COPY --from=builder /usr/src/app/dist ./dist

# Open internal routing port (must be 3000)
EXPOSE 3000

# Start deployment using Node
CMD ["node", "dist/server.cjs"]
