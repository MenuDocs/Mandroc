FROM node:alpine

WORKDIR /opt/mandroc

COPY package.json yarn.lock tsconfig.json ./

RUN yarn

COPY src src

CMD ["yarn", "start"]
