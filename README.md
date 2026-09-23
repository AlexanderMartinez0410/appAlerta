# App Alerta - Sistema de Seguridad Urbana, Movilidad y Alertas Comunitarias

Plataforma integral de reporte ciudadano colaborativo, gestión de incidentes urbanos y monitoreo geoespacial en tiempo real con **Clean Architecture** (Arquitectura Limpia), **NestJS**, **Prisma ORM**, **PostgreSQL 16** y **Expo (React Native / Web)**.

---

## 1. Descripcion del Sistema

App Alerta permite a los ciudadanos y entidades de seguridad:
1. **Visualizar Zonas de Riesgo en Vivo**: Mapa interactivo basado en OpenStreetMap con agrupamiento inteligente (*hotspots* y burbujas dinámicas) que crecen según la concentración de reportes en cada sector.
2. **Dispersión por Nivel de Zoom**: En zoom lejano muestra zonas macro con contadores de reportes; al acercarse (zoom >= 15), se disuelve en marcadores individuales en cada intersección exacta.
3. **Categorías e Incidentes Dinámicos**: Gestionados en base de datos:
   - **Seguridad y Delincuencia** (`#DA291C` - Rojo): Robos, asaltos, vehículos y pánico.
   - **Tránsito y Vías** (`#EA580C` - Naranja): Congestión, accidentes, vías cerradas y semáforos dañados.
   - **Transporte Público y Buses** (`#D97706` - Ámbar): Unidades averiadas, paradas saturadas y retrasos de ruta.
4. **Reporte en Zona Segura / Diferido**: Permite a las víctimas reportar incidentes una vez que han llegado a un lugar seguro, indicando el tiempo transcurrido (hace 15 min, hace 1 hora, etc.) para no exponer su ubicación actual.
5. **Motor de Confianza y Prevención de Spam**: Puntuación oculta de reputación por usuario. Reportes falsos reducen el puntaje y causan bloqueo automático (`reputacionScore <= -10`).
6. **Diseño Apple HIG y UI-Craft**: Interfaz minimalista sin emojis ni iconos genéricos, controles con área táctil >= 44pt y navegación mediante paneles deslizantes inferiores (*Bottom Sheets*).

---

## 2. Arquitectura del Proyecto

```
appAlerta/
├── backend/                      # API REST NestJS + TypeScript (Clean Architecture)
│   ├── prisma/
│   │   ├── schema.prisma         # Modelos de BD (Usuario, Persona, RBAC, Categorías, Alertas)
│   │   └── seed.ts               # Semilla con roles, usuarios y categorías iniciales
│   ├── src/
│   │   ├── domain/               # Entidades de negocio e interfaces de repositorios
│   │   ├── application/          # Casos de uso (Login, Consultas, Lógica de Dominio)
│   │   ├── infrastructure/       # Prisma ORM, Estrategias JWT, Guards RBAC, DB Service
│   │   └── presentation/         # Controladores HTTP (Auth, Incidentes, Help)
│   └── Dockerfile                # Configuración de contenedor backend
│
├── frontend/                     # Aplicación Web & Móvil en Expo / React Native
│   ├── src/
│   │   ├── constants/theme.ts    # Tokens de diseño, paleta Ecuador y métricas Apple HIG
│   │   ├── infrastructure/       # Configuración de API y clientes HTTP
│   │   ├── presentation/         # Contexto de autenticación, vistas y componentes
│   │   │   ├── context/          # AuthContext con almacenamiento de tokens JWT
│   │   │   └── components/       # OpenStreetMap interactivo con clusterización
│   │   └── app/                  # Enrutador Expo Router (Pantalla principal e interfaces)
│   └── Dockerfile                # Multi-stage build para desarrollo y producción Nginx
│
├── docker-compose.yml            # Orquestación para Entorno de Desarrollo (Hot-Reload)
├── docker-compose.prod.yml       # Orquestación para Entorno de Producción
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore                    # Reglas de exclusión de repositorio
├── README.md                     # Documentación principal del proyecto
└── INSTRUCCIONES.md              # Manual de despliegue y solución de problemas
```

---

## 3. Requisitos Previos

- **Docker Desktop** (con soporte para Docker Compose).
- **Node.js 20+** (solo si se desea ejecutar de forma local fuera de Docker).
- **Git**.

---

## 4. Compilacion y Ejecucion con Docker (Recomendado)

### Modo Desarrollo (con Hot-Reload en vivo)

1. Crear el archivo `.env.dev` a partir de `.env.example`:
```bash
cp .env.example .env.dev
```

2. Compilar e iniciar los contenedores:
```bash
docker compose --env-file .env.dev up --build
```

3. URLs de acceso:
- **Frontend (App Web):** [http://localhost:8081](http://localhost:8081)
- **Backend (API REST):** [http://localhost:3000](http://localhost:3000)
- **Base de Datos PostgreSQL:** `localhost:5433`

---

## 5. Cuentas de Acceso Preconfiguradas (Seed)

| Rol | Correo Electronico | Contrasena | Permisos |
|---|---|---|---|
| **Super Administrador** | `alkut202@gmail.com` | `Admin1234!` | Acceso total al sistema y métricas |
| **Policía / Despacho** | `policia@alerta.gob.ec` | `Policia1234!` | Monitoreo y resolución de incidentes |
| **Ciudadano de Prueba** | `ciudadano@ejemplo.com` | `Ciudadano1234!` | Reporte de alertas ciudadanas |

---

## 6. Endpoints Principales de la API

- `GET /incidentes/categorias` - Obtiene las categorías de alerta y sus motivos activos.
- `POST /auth/login` - Autenticación con JWT (genera token de acceso).
- `GET /auth/profile` - Información del usuario autenticado (requiere Bearer Token).
- `GET /auth/admin-dashboard` - Métricas de administración (requiere rol ADMIN).
- `GET /auth/despacho-policial` - Consola policial (requiere rol POLICIA o ADMIN).

---

## 7. Ejecucion Local sin Docker (Opcional)

### Backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev
```

### Frontend:
```bash
cd frontend
npm install
npx expo start --web
```
