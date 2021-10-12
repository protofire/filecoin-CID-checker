FROM node:12-alpine

WORKDIR /app/

COPY ./ .

RUN yarn install

WORKDIR /app/packages/watcher

ENTRYPOINT [ "yarn", "start" ]
