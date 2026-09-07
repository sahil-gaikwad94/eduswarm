FROM node:22-slim
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts index.html ./
RUN npm install
COPY src ./src
RUN npm run build
RUN npm install -g serve
CMD ["serve","-s","dist","-l","5173"]
