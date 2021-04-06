FROM node:alpine AS deps

WORKDIR /opt/mandroc

COPY package.json yarn.lock ./
RUN yarn

FROM node:alpine

WORKDIR /opt/mandroc

COPY src src
COPY tsconfig.json .
COPY --from=deps /opt/mandroc .

RUN yarn build
CMD ["yarn", "start:prod"]
