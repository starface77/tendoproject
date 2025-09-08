# Backend Dockerfile для Chexol.uz
FROM node:18-alpine

# Установка системных зависимостей
RUN apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Создание директорий
WORKDIR /app
RUN mkdir -p uploads/products uploads/users uploads/categories logs

# Копирование package.json и установка зависимостей
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Копирование исходного кода
COPY . .

# Изменение прав
RUN chown -R nodejs:nodejs /app
USER nodejs

# Создание директорий для пользователя
RUN mkdir -p uploads/products uploads/users uploads/categories logs

# Экспорт порта
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Запуск приложения
CMD ["npm", "start"]



