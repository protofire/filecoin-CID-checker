FROM node:12 as build-stage

WORKDIR /app

COPY . /app/
RUN yarn

ARG REACT_APP_FILECOIN_CID_CHECKER_API
ENV REACT_APP_FILECOIN_CID_CHECKER_API $REACT_APP_FILECOIN_CID_CHECKER_API

RUN yarn build

RUN yarn global add serve
ENTRYPOINT ["serve", "-s", "build"]
