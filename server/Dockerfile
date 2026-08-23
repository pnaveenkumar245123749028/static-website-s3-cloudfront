FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy source
COPY server ./

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "src/server.js"]
