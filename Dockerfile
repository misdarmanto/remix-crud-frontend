FROM node:16-alpine
WORKDIR /usr/server/app

COPY . .
RUN npm install
RUN npm run build
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["npm", "run" ,"start"]