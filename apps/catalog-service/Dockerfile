# 1. Use a lightweight base image (Alpine Linux is tiny and secure)
FROM node:22-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy only the package files first (This optimizes Docker's caching system)
COPY package*.json ./

# 4. Install dependencies (We use 'ci' or '--omit=dev' for production to keep it lean)
RUN npm install --omit=dev

# 5. Copy the rest of our application code into the container
COPY . .

# 6. Expose the port our app runs on
EXPOSE 3001

# 7. Security Best Practice: Do not run the container as the 'root' user
USER node

# 8. The command to start our app
CMD ["node", "server.js"]