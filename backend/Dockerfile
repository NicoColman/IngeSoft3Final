# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 3001
ENV PORT=3001
# DB_* variables should be set at runtime (via docker-compose or Render environment variables)
CMD ["node", "src/server.js"]


