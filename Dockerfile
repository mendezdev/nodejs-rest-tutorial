FROM node:latest
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

ENV MONGO_ATLAS_PW mendezdev

RUN ls
RUN pwd

CMD node server.js