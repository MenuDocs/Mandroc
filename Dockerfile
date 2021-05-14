### base
FROM node:15.14.0-alpine3.10 AS base

WORKDIR /opt/mandroc

### dependencies & builder
FROM base AS builder

# install production dependencies.
COPY package.json yarn.lock ./

RUN yarn install --production --pure-lockfile
RUN cp -RL node_modules /tmp/node_modules

# install all dependencies
RUN yarn install --pure-lockfile

# Copy src, tsconfig.json, and prisma files
COPY src src
COPY prisma prisma
COPY tsconfig.json .

# Build
RUN yarn db:generate
RUN yarn build

### runner
FROM base

# copy runtime dependencies
COPY --from=builder /tmp/node_modules node_modules
COPY --from=builder /opt/mandroc/node_modules/@prisma/client/ ./node_modules/@prisma/client/
COPY --from=builder /opt/mandroc/node_modules/.prisma/client/ ./node_modules/.prisma/client/

# copy runtime distribution
COPY --from=builder /opt/mandroc/dist dist
COPY package.json .

CMD ["yarn", "start:prod"]
