FROM node:14

ARG NODE_ENV production
ARG PORT 3000

ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

WORKDIR /app
COPY package*.json ./
RUN npm i --silent

COPY ./src ./src

EXPOSE ${PORT}

CMD ["npm", "start"]

