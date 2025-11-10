## Proyecto Integrador - Frontend + Backend + CI/CD

### Tecnologías
- Backend: Node.js (Express) + PostgreSQL
- Frontend: React (Vite)
- Base de datos: PostgreSQL 16
- Pruebas: Jest (backend), Vitest (frontend), CodeceptJS + Playwright (e2e)
- Docker: Dockerfiles para frontend, backend y servicio de PostgreSQL, docker-compose para local
- CI/CD: GitHub Actions (build, test, build&push Docker, deploy hook opcional)

### Desarrollo local
1) Requisitos: Node >= 20, Docker, PostgreSQL (o usar Docker Compose)
   - Recomendado: `nvm install 20 && nvm use` (hay archivo `.nvmrc`)

2) Todo con Docker Compose (recomendado)
```
docker compose up --build
Frontend -> http://localhost:5173
Backend  -> http://localhost:3001/api/health
PostgreSQL -> localhost:5432
```
Los servicios se conectan automáticamente a través de la red de Docker.

3) Desarrollo local sin Docker
   - Instalar PostgreSQL localmente
   - Backend:
     ```
     cd backend
     npm install
     # Setear variables de entorno (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
     npm run dev
     ```
   - Frontend:
     ```
     cd frontend
     npm install
     npm run dev
     ```

### Pruebas
- Backend: Requiere PostgreSQL corriendo. Con Docker Compose: `docker compose up -d database` y luego `cd backend && npm test`
- Frontend: `cd frontend && npm run test`
- E2E (local): Requiere servicios corriendo. Con Docker Compose: `docker compose up` y luego `cd e2e && npm install && BASE_URL=http://localhost:5173 npm test`

### CI/CD
Configurar Secrets en el repo:
- `DOCKERHUB_USERNAME` (si no se setea, por defecto usa `nicocolman3`)
- `DOCKERHUB_TOKEN`
- `RENDER_DEPLOY_HOOK` (opcional para deploy)
- `PROD_BASE_URL` (opcional para e2e contra producción)

Cada push a `main`/`master`:
1) Corre tests (backend, frontend)
2) Construye y publica imágenes en Docker Hub
   - `${DOCKERHUB_USERNAME}/ingsoft3-backend:latest`
   - `${DOCKERHUB_USERNAME}/ingsoft3-frontend:latest`
3) (Opcional) Dispara deploy vía webhook
4) (Opcional) Corre e2e contra producción

### Despliegue en Render

#### Opción 1: Desde GitHub (Recomendado)
1) **Base de datos PostgreSQL** (PostgreSQL Service)
   - Crear servicio PostgreSQL en Render
   - Versión: PostgreSQL 16
   - Guardar las credenciales (host, port, database, user, password)

2) **Backend** (Web Service desde GitHub)
   - Crear Web Service desde repositorio GitHub
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Env Vars:
     - `PORT=3001`
     - `DB_HOST=<host-de-postgres>`
     - `DB_PORT=5432`
     - `DB_NAME=<nombre-de-db>`
     - `DB_USER=<usuario>`
     - `DB_PASSWORD=<password>`
   - Activar Deploy Hook y guardar URL en GitHub Secret `RENDER_DEPLOY_HOOK_BACKEND`

3) **Frontend** (Static Site desde GitHub)
   - Crear Static Site desde repositorio GitHub
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - Redirects/Rewrites:
     - Source: `/api/*`
     - Destination: `https://<tu-backend>.onrender.com/api/$1`
     - Action: `Rewrite`
   - Source: `/*`
   - Destination: `/index.html`
   - Action: `Rewrite`
   - Activar Deploy Hook y guardar URL en GitHub Secret `RENDER_DEPLOY_HOOK_FRONTEND`

#### Opción 2: Desde Docker Hub
1) **Base de datos PostgreSQL** (igual que arriba)
2) **Backend** (Web Service desde Docker Registry)
   - Imagen: `nicocolman3/ingsoft3-backend:latest`
   - Port: 3001
   - Env Vars: igual que arriba
3) **Frontend** (Static Site desde GitHub o Web Service desde Docker)
   - Si usás Static Site, configuración igual que arriba
   - Si usás Web Service con Docker, usar imagen `nicocolman3/ingsoft3-frontend:latest` y env var `BACKEND_ORIGIN`

4) **E2E contra Producción**
   - Setear `PROD_BASE_URL` al dominio público del Frontend en Render


### Endpoints
- `GET /api/health` -> `{ status: 'ok' }`
- `GET /api/items` -> lista de items
- `POST /api/items` -> crea item `{ name }`
- `DELETE /api/items/:id` -> borra item

### Próximos pasos sugeridos
- Provisionar deploy en Render/Railway (servicios Docker) y guardar los URLs
- Ajustar variables y secrets en GitHub para pipeline end-to-end
- Agregar más test cases (unitarios y e2e)


