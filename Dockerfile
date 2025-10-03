# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS deps

WORKDIR /app

# Copiar solo archivos de dependencias para aprovechar cache de Docker
COPY frontend/package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci && \
    npm cache clean --force

# ============================================
# Stage 2: Builder
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias desde stage anterior (aprovecha cache)
COPY --from=deps /app/node_modules ./node_modules

# Copiar archivos de configuración
COPY frontend/package*.json ./
COPY frontend/vite.config.js ./
COPY frontend/index.html ./

# Copiar código fuente
COPY frontend/src ./src
COPY frontend/public ./public

# Construir la aplicación para producción
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM nginx:alpine AS production

# Instalar wget para healthcheck
RUN apk add --no-cache wget && \
    rm -rf /var/cache/apk/*

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Crear usuario nginx y ajustar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Cambiar a puerto 8080 para evitar necesidad de root
RUN sed -i 's/listen\s*80;/listen 8080;/' /etc/nginx/conf.d/default.conf || true

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# Nginx ya corre como nginx user por defecto en alpine

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]