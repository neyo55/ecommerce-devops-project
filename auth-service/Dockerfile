FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY server.js .

# Enforce security by running as non-root user
USER node

EXPOSE 3002

CMD ["npm", "start"]