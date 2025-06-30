# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from root
COPY ../../package*.json ./
COPY ../../pnpm-lock.yaml* ./

# Copy all source code
COPY ../../ ./

# Install dependencies
RUN npm install

# Build the backend
WORKDIR /app/apps/backend
RUN npm run build

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "start:prod"]