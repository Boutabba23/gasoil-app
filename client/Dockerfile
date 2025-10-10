FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json ./


RUN pnpm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "pnpm", "run", "dev" ]