FROM --platform=linux/amd64 node:lts-alpine
WORKDIR /usr/app
COPY package.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]