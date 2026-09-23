# App Alerta 🚨

Aplicación fullstack con **Clean Architecture** (Arquitectura Limpia) en Backend y Frontend, base de datos **PostgreSQL**, y soporte de compilación y orquestación con **Docker Compose**.

---

## 🏗️ Estructura del Proyecto

```
appAlerta/
├── backend/                  # NestJS + TypeScript (Clean Architecture)
│   ├── src/
│   │   ├── domain/           # Entidades e interfaces de repositorio
│   │   ├── application/      # Casos de uso (GetHelpUseCase)
│   │   ├── infrastructure/   # Base de datos PostgreSQL y repositorios
│   │   └── presentation/     # Controladores HTTP (HelpController -> /help)
│   └── Dockerfile            # Multi-stage build (dev & prod)
│
├── frontend/                 # React Native / Expo Web (Clean Architecture)
│   ├── src/
│   │   ├── domain/           # Modelos e interfaces
│   │   ├── application/      # Casos de uso
│   │   ├── infrastructure/   # API Repository HTTP y configuración
│   │   └── presentation/     # Hooks (useHelp) y Pantalla con 1 solo botón
│   └── Dockerfile            # Multi-stage build (dev & Nginx prod)
│
├── init.sql                  # Script inicial de BD (tabla help con registro id:1)
├── docker-compose.yml        # Docker Compose para Desarrollo (Hot-Reload)
├── docker-compose.prod.yml   # Docker Compose para Producción (Nginx + Node)
├── .env.dev                  # Variables de entorno para desarrollo (no se sube a Git)
├── .env.prod                 # Variables de entorno para producción (no se sube a Git)
├── .env.example              # Plantilla de ejemplo de variables de entorno
├── .gitignore                # Reglas de exclusión para Git
└── INSTRUCCIONES.md          # Guía detallada paso a paso para compilar y ejecutar
```

---

## ⚡ Inicio Rápido con Docker

### 1. Desarrollo con Hot-Reload (Recarga en vivo)
```bash
docker compose --env-file .env.dev up --build
```
- **Frontend:** http://localhost:8081
- **Backend:** http://localhost:3000/help

### 2. Producción (Compilado y Servido con Nginx)
```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
```

> Para consultar la guía completa con solución de problemas, revisa el archivo [INSTRUCCIONES.md](INSTRUCCIONES.md).
