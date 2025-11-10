# syntax=docker/dockerfile:1
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
EXPOSE 3001
ENV PORT=3001
ENV DB_HOST=database
ENV DB_PORT=5432
ENV DB_NAME=ingsoft3
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
CMD ["node", "src/server.js"]


