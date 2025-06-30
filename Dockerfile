FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Copy all source code
COPY . .

# Install dependencies
RUN npm install

# Build backend
RUN npm run backend:build

# Expose port
EXPOSE 4000

# Start backend
CMD ["npm", "run", "backend:start"]