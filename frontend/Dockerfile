FROM node:22.16-alpine

WORKDIR /app-frontend

COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

CMD [ "npm", "run", "start" ]