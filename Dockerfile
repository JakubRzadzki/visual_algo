# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the frontend using Vite
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
