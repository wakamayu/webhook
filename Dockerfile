FROM node:lts-alpine3.14
WORKDIR /app
COPY . .
RUN ls -alh
RUN npm install && npm install -g . && npm link
