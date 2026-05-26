# ==========================================
# STAGE 1: Build the React application
# ==========================================
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: Serve the app with Nginx
# ==========================================
FROM nginx:alpine

# Copy the static files from the 'build' stage into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (default HTTP port for Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]