
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install 

RUN npm install nodemon -g

COPY . .

EXPOSE 8000

CMD ["nodemon", "app.js"]