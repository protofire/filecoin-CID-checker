FROM node:12 as build-stage

WORKDIR /app

COPY ./ .

RUN yarn install

ARG REACT_APP_FILECOIN_CID_CHECKER_API
ENV REACT_APP_FILECOIN_CID_CHECKER_API /api

RUN cd packages/frontend && ls -la && yarn run build
RUN env
RUN yarn global add serve

WORKDIR /app/packages/frontend

ENTRYPOINT ["serve", "-s", "build"]
