# Etapa 1: Compilação (builder)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# Etapa 2: Produção
FROM ghcr.io/puppeteer/puppeteer:latest

ENV NODE_ENV=production
WORKDIR /app

# Cria o diretório como pptruser primeiro
RUN mkdir -p /app/node_modules && chown -R pptruser:pptruser /app

# Copia os arquivos como root e depois ajusta as permissões
USER root
COPY --chown=pptruser:pptruser --from=builder /app/node_modules ./node_modules
COPY --chown=pptruser:pptruser --from=builder /app/dist ./dist
COPY --chown=pptruser:pptruser package*.json ./

USER pptruser

EXPOSE 3002
CMD ["node", "dist/index.js"]