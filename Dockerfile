FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/package*.json ./packages/database/

# Install dependencies
RUN npm install

# Install backend dependencies
RUN cd apps/backend && npm install

# Install database dependencies (for Prisma CLI)
RUN cd packages/database && npm install

# Copy database schema
COPY packages/database/ ./packages/database/

# Copy backend source
COPY apps/backend/ ./apps/backend/

# Build (this will run prebuild automatically)
RUN cd apps/backend && npm run build

# Expose port
EXPOSE 4000

# Start backend
CMD ["sh", "-c", "cd apps/backend && npm run start:prod"]