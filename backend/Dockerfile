FROM node:22.16-alpine

WORKDIR /app-backend

RUN apk add --no-cache ffmpeg

COPY package.json package-lock.json ./

RUN npm ci

COPY . ./

CMD [ "npm", "run", "start" ]