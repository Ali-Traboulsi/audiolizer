FROM node:20-alpine

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Copy backend package.json
COPY apps/backend/package*.json ./apps/backend/

# Install root dependencies
RUN npm install

# Install backend dependencies specifically
WORKDIR /app/apps/backend
RUN npm install

# Go back to root and copy source code
WORKDIR /app
COPY . .

# Build backend (now nest CLI will be available)
RUN npm run backend:build

# Expose port
EXPOSE 4000

# Start backend
CMD ["npm", "run", "backend:start"]