# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS deps

WORKDIR /usr/src/app

# Copiar solo archivos de dependencias para aprovechar cache de Docker
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --omit=dev && \
    npm cache clean --force

# ============================================
# Stage 2: Production
# ============================================
FROM node:18-alpine AS production

# Instalar wget para health check (paquete mínimo)
RUN apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

# Copiar dependencias desde stage anterior (aprovecha cache)
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copiar solo archivos necesarios para producción
COPY package*.json ./
COPY src ./src

# Crear usuario no root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

# Cambiar a usuario sin privilegios
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check optimizado
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

# Variables de entorno por defecto
ENV NODE_ENV=production \
    PORT=3000

# Comando para ejecutar la aplicación
CMD ["node", "src/server.js"]