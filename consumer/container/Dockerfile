FROM node:18-alpine as BASE

RUN apk update
RUN apk upgrade
RUN apk add --no-cache ffmpeg

WORKDIR /app
RUN  mkdir videos
RUN mkdir transcoded

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

CMD [ "npm", "start" ]

