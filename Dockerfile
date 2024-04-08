FROM node:19.7-slim
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "index.js"]
# CMD ["ls", "-l"]
