FROM node:18-alpine


WORKDIR /reddit/server

COPY package*.json ./
COPY yarn*.look ./

RUN yarn install --production


COPY . .

RUN yarn build

CMD [ "yarn", "start" ]