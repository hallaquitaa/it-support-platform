FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Instalar exceljs específicamente
RUN npm install exceljs

COPY . .

RUN mkdir -p backups data

EXPOSE 3000

CMD ["node", "src/app.js"]