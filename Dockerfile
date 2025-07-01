FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/database/ ./packages/database/

# Install dependencies
RUN npm install
RUN cd apps/backend && npm install

# Copy source code
COPY apps/backend/ ./apps/backend/

# Build (prebuild will generate Prisma)
RUN cd apps/backend && npm run build

# Expose port
EXPOSE 4000

# Start backend
CMD ["sh", "-c", "cd apps/backend && npm run start:prod"]