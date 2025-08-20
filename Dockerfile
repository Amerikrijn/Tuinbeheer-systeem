FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY . .
EXPOSE 3000
CMD ["npm", "run", "ci:quality"]
