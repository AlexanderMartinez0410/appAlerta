# Manual de Compilación, Ejecución y Gestión de Base de Datos

Esta guía detalla los pasos para compilar, levantar y gestionar **App Alerta** mediante Docker y herramientas locales.

---

## 1. Verificación de Entorno

Asegúrese de tener **Docker Desktop** en ejecución.

Si los puertos locales estuvieran en conflicto:
- El puerto expuesto de PostgreSQL en el host es `5433` (mapeado internamente al `5432` del contenedor de base de datos) para evitar choques con servicios PostgreSQL locales existentes.
- El backend corre en el puerto `3000`.
- El frontend corre en el puerto `8081`.

---

## 2. Compilación y Despliegue con Docker

### Modo Desarrollo (Hot-Reload)

Permite que cualquier cambio en los archivos de TypeScript en `frontend/` o `backend/` se refleje inmediatamente.

```powershell
# Detener contenedores previos si existen
docker compose down

# Compilar e iniciar los servicios
docker compose --env-file .env.dev up --build
```

### Modo Producción

Genera los builds optimizados (Nginx para el frontend y bundle compilado de Node.js para el backend):

```powershell
# Iniciar en segundo plano
docker compose --env-file .env.prod -f docker-compose.prod.yml up --build -d

# Ver logs en vivo
docker compose -f docker-compose.prod.yml logs -f

# Detener servicios
docker compose -f docker-compose.prod.yml down
```

---

## 3. Administración de la Base de Datos con Prisma ORM

### Modificación del Esquema

El archivo principal de modelos está en `backend/prisma/schema.prisma`.

Para agregar o modificar campos:
1. Edite `backend/prisma/schema.prisma`.
2. Para regenerar el cliente de TypeScript tipado:
```powershell
cd backend
npx prisma generate
```
3. Para sincronizar los cambios con la base de datos de desarrollo:
```powershell
npx prisma db push
```

### Poblado de Datos Iniciales (Seed)

Para ejecutar la carga de usuarios y categorías:
```powershell
cd backend
npx prisma db seed
```

### Explorador Visual de Base de Datos (Prisma Studio)

Para abrir la interfaz gráfica de administración de datos en el navegador:
```powershell
cd backend
npx prisma studio
```
Se abrirá automáticamente en `http://localhost:5555`.

---

## 4. Solución de Problemas Frecuentes

1. **Error de Conexión a Base de Datos en el Host:**
   - Asegúrese de conectarse a `localhost:5433` (y no a `5432`) si utiliza clientes externos como DBeaver o pgAdmin.
2. **Reinicio Completo y Limpieza de Volúmenes:**
   ```powershell
   docker compose down -v
   docker compose --env-file .env.dev up --build
   ```
