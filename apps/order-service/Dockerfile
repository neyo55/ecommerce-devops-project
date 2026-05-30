FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY server.js .

USER node

EXPOSE 3003

CMD ["npm", "start"]