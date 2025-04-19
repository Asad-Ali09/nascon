FROM node:20-alpine as build

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM build as dev

EXPOSE 5000

CMD [ "npm", "run", "dev" ]

FROM node:20-alpine  as production

ENV NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

COPY --from=build /usr/src/app/dist ./dist

EXPOSE 5000

CMD [ "node", "dist/server.js" ]