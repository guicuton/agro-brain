#########################
####### BUILD ###########
#########################
FROM node:22-alpine AS build

USER node
WORKDIR /home/agro-brain

COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .

RUN npx prisma generate --schema=libs/database/prisma/schema.prisma

RUN mkdir -p dist/libs/database/prisma
RUN cp libs/database/prisma/schema.prisma dist/libs/database/prisma/

RUN npm run build

##########################
####### BUILD PROD #######
##########################
FROM node:22-alpine AS prod

RUN apk add --no-cache curl
RUN npm install -g pm2 pm2-runtime

USER node
WORKDIR /home/agro-brain

COPY --from=build --chown=node:node /home/agro-brain ./

EXPOSE 3000

CMD ["pm2-runtime", "start", "./app.json"]