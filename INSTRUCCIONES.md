# 🚀 Guía de Compilación, Ejecución y Despliegue con Docker y Prisma ORM

Esta guía detalla todo lo necesario para compilar y ejecutar **App Alerta** con Docker (Backend NestJS con **Prisma ORM** + Frontend Expo Web + Base de Datos PostgreSQL con Clean Architecture).

---

## 📋 1. Requisitos Previos

1. **Tener Docker Desktop instalado y corriendo en Windows:**
   - Asegúrate de que el icono de Docker en la barra de tareas de Windows indique *"Engine running"*.
2. **Variables de entorno:**
   - El archivo `.env.dev` ya está preparado con `DATABASE_URL` y puerto `5433` para evitar conflictos con PostgreSQL local.

---

## 🛠️ 2. Compilación y Ejecución en Modo Desarrollo (Hot-Reload)

Cualquier cambio en el código de **Frontend** o **Backend** se actualiza en vivo sin reiniciar contenedores.

### Paso 1: Limpiar contenedores previos
```powershell
docker compose down
```

### Paso 2: Compilar y levantar
```powershell
docker compose --env-file .env.dev up --build
```

### URLs de Acceso:
- **Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend API:** [http://localhost:3000/help](http://localhost:3000/help)
- **PostgreSQL (Host):** `localhost:5433`

---

## 💎 3. ¿Cómo modificar la Base de Datos desde Código con Prisma ORM?

El proyecto utiliza **Prisma ORM** en la capa de infraestructura del Backend.

### A. Modificar o agregar tablas:
Edita el archivo [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma):
```prisma
model Help {
  id    Int    @id @default(autoincrement())
  texto String

  @@map("help")
}

// Ejemplo: Puedes agregar nuevos modelos fácilmente:
// model Usuario {
//   id        Int      @id @default(autoincrement())
//   nombre    String
//   email     String   @unique
//   createdAt DateTime @default(now())
// }
```

### B. Aplicar cambios y generar tipos de TypeScript:
Desde la carpeta `backend`:
```powershell
# 1. Regenerar el cliente de TypeScript tipado
npx prisma generate

# 2. Si deseas crear una migración en la BD:
npx prisma migrate dev --name nuevo_modelo
```

### C. Visualizador visual de base de datos (Prisma Studio):
Para ver y editar los datos de la base de datos visualmente en tu navegador:
```powershell
cd backend
npx prisma studio
```
*(Abre automáticamente una interfaz web en `http://localhost:5555`)*.

---

## 📦 4. Compilación y Ejecución en Modo Producción

En este modo se generan builds optimizados (Nginx + Node producción):

```powershell
docker compose --env-file .env.prod -f docker-compose.prod.yml up --build -d
```

### Ver logs:
```powershell
docker compose -f docker-compose.prod.yml logs -f
```

### Detener:
```powershell
docker compose -f docker-compose.prod.yml down
```

---

## ⚠️ 5. Solución de Problemas Comunes

- **Puerto ocupado:** El puerto de PostgreSQL hacia tu máquina host es `5433` para evitar conflicto con instalaciones locales en `5432`.
- **Nuevas dependencias:** Si agregas librerías a `package.json`, reconstruye con `docker compose --env-file .env.dev up --build`.
- **Reinicio limpio de datos:** `docker compose down -v` y luego levantar con `up --build`.
