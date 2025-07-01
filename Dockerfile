FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./
COPY apps/backend/package*.json ./apps/backend/

# Install dependencies
RUN npm install
RUN cd apps/backend && npm install

# Copy database schema and generate client
COPY packages/database/ ./packages/database/
RUN cd packages/database && npx prisma generate

# Copy backend source
COPY apps/backend/ ./apps/backend/

# Build backend
RUN cd apps/backend && npm run build

# Expose port
EXPOSE 4000

# Start backend
CMD ["cd", "apps/backend", "&&", "npm", "run", "start:prod"]