FROM node:11.3.0

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN yarn install && yarn cache clean

CMD [ "yarn", "start" ]

EXPOSE 3000
