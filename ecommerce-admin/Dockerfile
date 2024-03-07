FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
ENV NODE_ENV=production
COPY . .
RUN npm run build
RUN npm postinstall
EXPOSE 3000
CMD ["npm","run"]