FROM node:latest as build
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


FROM node:latest as runner
WORKDIR /app

COPY --from=build /build/src src/
COPY --from=build /build/dist dist/
COPY --from=build /build/package*.json .

RUN npm install --only=prod

EXPOSE 8080

CMD [ "npm", "run", "server:dev" ]