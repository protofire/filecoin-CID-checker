FROM node:12-alpine

WORKDIR /app/

COPY ./ .

EXPOSE 3000

WORKDIR /app/packages/backend

RUN yarn install

ENTRYPOINT [ "yarn", "start" ]
