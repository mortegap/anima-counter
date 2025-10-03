.PHONY: help dev prod build up down logs clean test

# Variables
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.yaml

# Colores para output
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[0;33m
NC = \033[0m # No Color

##@ General

help: ## Mostrar esta ayuda
	@echo "$(BLUE)Anima Counter - Makefile Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "$(GREEN)Usage:$(NC)\n  make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

dev: ## Iniciar entorno de desarrollo (hot-reload)
	@echo "$(GREEN)🚀 Iniciando entorno de desarrollo...$(NC)"
	$(DOCKER_COMPOSE_DEV) up

dev-build: ## Iniciar desarrollo reconstruyendo imágenes
	@echo "$(GREEN)🔨 Reconstruyendo y iniciando desarrollo...$(NC)"
	$(DOCKER_COMPOSE_DEV) up --build

dev-detached: ## Iniciar desarrollo en background
	@echo "$(GREEN)🚀 Iniciando desarrollo en background...$(NC)"
	$(DOCKER_COMPOSE_DEV) up -d

dev-down: ## Detener entorno de desarrollo
	@echo "$(YELLOW)⏹️  Deteniendo desarrollo...$(NC)"
	$(DOCKER_COMPOSE_DEV) down

dev-clean: ## Detener y limpiar volúmenes de desarrollo
	@echo "$(YELLOW)🧹 Limpiando entorno de desarrollo...$(NC)"
	$(DOCKER_COMPOSE_DEV) down -v
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

dev-logs: ## Ver logs de desarrollo
	$(DOCKER_COMPOSE_DEV) logs -f

dev-logs-backend: ## Ver logs del backend
	$(DOCKER_COMPOSE_DEV) logs -f backend

dev-logs-frontend: ## Ver logs del frontend
	$(DOCKER_COMPOSE_DEV) logs -f frontend

dev-restart: ## Reiniciar servicios de desarrollo
	@echo "$(YELLOW)🔄 Reiniciando servicios...$(NC)"
	$(DOCKER_COMPOSE_DEV) restart

##@ Production

prod: ## Iniciar entorno de producción
	@echo "$(GREEN)🚀 Iniciando producción...$(NC)"
	$(DOCKER_COMPOSE_PROD) up -d

prod-build: ## Construir e iniciar producción
	@echo "$(GREEN)🔨 Construyendo producción...$(NC)"
	$(DOCKER_COMPOSE_PROD) up -d --build

prod-down: ## Detener producción
	@echo "$(YELLOW)⏹️  Deteniendo producción...$(NC)"
	$(DOCKER_COMPOSE_PROD) down

prod-logs: ## Ver logs de producción
	$(DOCKER_COMPOSE_PROD) logs -f

prod-restart: ## Reiniciar producción
	@echo "$(YELLOW)🔄 Reiniciando producción...$(NC)"
	$(DOCKER_COMPOSE_PROD) restart

##@ Database

db-shell: ## Conectar a PostgreSQL (desarrollo)
	@echo "$(BLUE)📊 Conectando a PostgreSQL...$(NC)"
	$(DOCKER_COMPOSE_DEV) exec postgres psql -U anima_user -d anima_counter_dev

db-backup: ## Crear backup de la base de datos
	@echo "$(GREEN)💾 Creando backup...$(NC)"
	@mkdir -p backups
	$(DOCKER_COMPOSE_DEV) exec -T postgres pg_dump -U anima_user anima_counter_dev > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)✅ Backup creado en backups/$(NC)"

db-restore: ## Restaurar backup (usar: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(YELLOW)⚠️  Uso: make db-restore FILE=backups/backup-XXXXXXX.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)⚠️  Restaurando backup: $(FILE)$(NC)"
	$(DOCKER_COMPOSE_DEV) exec -T postgres psql -U anima_user anima_counter_dev < $(FILE)
	@echo "$(GREEN)✅ Backup restaurado$(NC)"

db-reset: ## Reiniciar base de datos (⚠️ BORRA TODOS LOS DATOS)
	@echo "$(YELLOW)⚠️  ADVERTENCIA: Esto borrará todos los datos$(NC)"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🗑️  Reseteando base de datos...$(NC)"; \
		$(DOCKER_COMPOSE_DEV) down -v; \
		$(DOCKER_COMPOSE_DEV) up -d postgres; \
		echo "$(GREEN)✅ Base de datos reseteada$(NC)"; \
	fi

##@ Utilities

ps: ## Ver estado de contenedores
	@echo "$(BLUE)📋 Estado de contenedores:$(NC)"
	@$(DOCKER_COMPOSE_DEV) ps

logs: ## Ver todos los logs (desarrollo)
	$(DOCKER_COMPOSE_DEV) logs -f

shell-backend: ## Abrir shell en contenedor backend
	$(DOCKER_COMPOSE_DEV) exec backend sh

shell-frontend: ## Abrir shell en contenedor frontend
	$(DOCKER_COMPOSE_DEV) exec frontend sh

clean: ## Limpiar todo (contenedores, imágenes, volúmenes)
	@echo "$(YELLOW)⚠️  ADVERTENCIA: Esto eliminará todos los contenedores, imágenes y volúmenes$(NC)"
	@read -p "¿Estás seguro? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(YELLOW)🧹 Limpiando todo...$(NC)"; \
		$(DOCKER_COMPOSE_DEV) down -v --rmi all; \
		$(DOCKER_COMPOSE_PROD) down -v --rmi all; \
		docker system prune -af; \
		echo "$(GREEN)✅ Limpieza completada$(NC)"; \
	fi

install: ## Instalar dependencias localmente
	@echo "$(GREEN)📦 Instalando dependencias del backend...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)📦 Instalando dependencias del frontend...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✅ Dependencias instaladas$(NC)"

env-setup: ## Crear archivos .env desde ejemplos
	@if [ ! -f .env ]; then \
		cp .env.dev.example .env; \
		echo "$(GREEN)✅ Creado .env desde .env.dev.example$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env ya existe$(NC)"; \
	fi

##@ Testing (Pendiente - Fase 4)

test: ## Ejecutar tests (pendiente)
	@echo "$(YELLOW)⚠️  Tests no implementados aún (Fase 4)$(NC)"

test-backend: ## Tests del backend (pendiente)
	@echo "$(YELLOW)⚠️  Tests de backend no implementados aún$(NC)"

test-frontend: ## Tests del frontend (pendiente)
	@echo "$(YELLOW)⚠️  Tests de frontend no implementados aún$(NC)"
