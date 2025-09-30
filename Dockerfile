# Multi-stage build para optimizar el tamaño final
FROM node:18-alpine as builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos estáticos
COPY . .

# Etapa de producción con nginx
FROM nginx:alpine

# Copiar archivos estáticos al directorio de nginx
COPY --from=builder /app /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]