FROM node:18

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 2300
CMD ["npm", "start"]