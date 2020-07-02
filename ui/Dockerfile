FROM node:12 as build-stage

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app/

ARG REACT_APP_FILECOIN_CID_CHECKER_API
ENV REACT_APP_FILECOIN_CID_CHECKER_API $REACT_APP_FILECOIN_CID_CHECKER_API

RUN npm run build

FROM nginx:1.19
COPY --from=build-stage /app/build/ /usr/share/nginx/html
