FROM node:latest AS build
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:latest AS runner
WORKDIR /app

COPY --from=build /build/src src/
COPY --from=build /build/dist dist/
COPY --from=build /build/package*.json .

RUN touch .env

RUN npm install --only=prod

EXPOSE 80

CMD [ "npm", "run", "server:dev" ]