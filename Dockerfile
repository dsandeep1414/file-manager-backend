FROM node:16-alpine
# ENV NODE_ENV=dev
WORKDIR /app
COPY package.json ./
# COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../
# COPY . .
RUN npm i -g @nestjs/cli
RUN npm install -f
EXPOSE 3006 30600
COPY . .
# RUN chown -R node /usr/src/app
# USER node
CMD [ "npm", "run", "start" ]
