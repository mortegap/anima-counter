# Multi-stage build para optimizar el tamaño final
FROM node:18-alpine as builder

# Directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY frontend/package*.json ./

# Instalar todas las dependencias (necesarias para build)
RUN npm ci

# Copiar el resto de archivos del frontend
COPY frontend/ ./

# Construir la aplicación
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar archivos compilados desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]