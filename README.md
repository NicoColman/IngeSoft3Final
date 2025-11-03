## Proyecto Integrador - Frontend + Backend + CI/CD

### Tecnologías
- Backend: Node.js (Express) + SQLite (better-sqlite3)
- Frontend: React (Vite)
- Pruebas: Jest (backend), Vitest (frontend), CodeceptJS + Playwright (e2e)
- Docker: Dockerfiles para frontend y backend, docker-compose para local
- CI/CD: GitHub Actions (build, test, build&push Docker, deploy hook opcional)

### Desarrollo local
1) Requisitos: Node >= 20, Docker
   - Recomendado: `nvm install 20 && nvm use` (hay archivo `.nvmrc`)
2) Backend
```
cd backend
npm ci
npm run dev
```
3) Frontend (dev con proxy a backend)
```
cd frontend
npm ci
npm run dev
```
4) Todo con Docker
```
docker compose up --build
Frontend -> http://localhost:5173
Backend  -> http://localhost:3001/api/health
```

### Pruebas
- Backend: `cd backend && npm test`
- Frontend: `cd frontend && npm run test`
- E2E (local): `cd e2e && npm ci && BASE_URL=http://localhost:5173 npm test`

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

### Despliegue en Render (usando imágenes de Docker Hub)
1) Backend (Web Service)
   - Crear servicio de tipo Web Service
   - Fuente: Docker Registry (Docker Hub)
   - Imagen: `nicocolman3/ingsoft3-backend:latest`
   - Port: 3001
   - Env Vars: `PORT=3001`, `SQLITE_PATH=/data/data.db`
   - Disk persistente: montar `/data` (p. ej. 1GB)

2) Frontend (Web Service)
   - Crear servicio Web Service
   - Docker Registry: `nicocolman3/ingsoft3-frontend:latest`
   - Port interno: 80

3) Deploy Hook
   - En Backend y/o Frontend, activar Deploy Hook y copiar la URL
   - Guardar la(s) URL(s) en GitHub Secret `RENDER_DEPLOY_HOOK` (si usás dos, podés usar un servicio intermedio o concatenar dos steps similares en el workflow)

4) E2E contra Producción
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


