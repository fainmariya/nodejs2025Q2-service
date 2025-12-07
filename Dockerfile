# --- Сборка (builder) ---
    FROM node:24-slim AS builder

    WORKDIR /usr/src/app
    
    # Ставим openssl (чтобы Prisma нормально определил версию и скачал правильный бинарь)
    RUN apt-get update -y && apt-get install -y openssl
    
    # Зависимости
    COPY package*.json ./
    RUN npm ci
    
    # Код
    COPY . .
    
    # Генерим Prisma Client внутри ИМЕННО этого окружения (linux-arm64 + openssl)
    RUN npx prisma generate
    
    # Сборка NestJS
    RUN npm run build
    
    # Очищаем dev-зависимости для меньшего образа
    RUN npm prune --omit=dev
    
    
    # --- Запуск (runner) ---
    FROM node:24-slim AS runner
    
    WORKDIR /usr/src/app
    ENV NODE_ENV=production
    
    # Тут тоже нужен openssl, чтобы рантайм Prisma нашёл libssl
    RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
    
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    COPY --from=builder /usr/src/app/dist ./dist
    COPY --from=builder /usr/src/app/prisma ./prisma
    
    EXPOSE 4000
    
    CMD ["node", "dist/main.js"]
    