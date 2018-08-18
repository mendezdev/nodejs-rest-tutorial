FROM node:latest
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

RUN ls
RUN pwd

CMD node server.js