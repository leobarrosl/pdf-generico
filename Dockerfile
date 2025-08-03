# Etapa 1: Build da aplicação
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Instala o Chrome do Puppeteer
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer
RUN npx puppeteer browsers install chrome

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Etapa 2: imagem de runtime com Chrome headless
FROM node:20-slim

# Dependências necessárias para executar o Chrome headless
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Copia app e cache do Chrome
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.cache/puppeteer /root/.cache/puppeteer

# Define variáveis de ambiente para Puppeteer
ENV PUPPETEER_CACHE_DIR=/root/.cache/puppeteer

EXPOSE 3000
CMD ["node", "dist/index.js"]
