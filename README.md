# LTI - Talent Tracking System  | EN

This project is a full-stack application with a React frontend and an Express backend using Prisma as an ORM. The frontend is initiated with Create React App, and the backend is written in TypeScript.

## Directory and File Explanation

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`:  The entry point for the backend server.
  - `prisma/`: Contains the Prisma schema file for ORM.
  - `tsconfig.json`: TypeScript configuration file.
  - `.env`: Contains the environment variables.
- `frontend/`: Contains the client-side code written in React.
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `docker-compose.yml`: Contains the Docker Compose configuration to manage your application's services.
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend

The frontend is a React application, and its main files are located in the `src` directory. The `public` directory contains static assets, and the build directory contains the production `build` of the application.

### Backend

El backend es una aplicación Express escrita en TypeScript.
- The `src` directory contains the source code
- The `prisma` directory contains the Prisma schema.

## Run the application locally

### Prerequisites

- **Node.js** and **npm** installed.
- **PostgreSQL** reachable on your machine. You can:
  - start it with **Docker** from this repo (`docker compose up -d`), **or**
  - use an **already running** PostgreSQL instance (same host/port/user/database as in `backend/.env`).

### Environment files

1. **`backend/.env`** (see `backend/.env.example`):
   - **`DATABASE_URL`**: use a **full connection string**. Plain `dotenv` does **not** expand `${VAR}` placeholders—write the URL explicitly, e.g.  
     `postgresql://LTIdbUser:YOUR_PASSWORD@localhost:5432/LTIdb`
   - **`FRONTEND_URL`**: must match the React dev server origin, usually `http://localhost:3000` (needed for **CORS** and **session cookies**).
   - **`SESSION_SECRET`**: any long random string for local dev.
   - **`PORT`**: API port (default in code is **3010** if unset).

2. **`frontend/.env.local`** (copy from `frontend/.env.example`):
   - **`REACT_APP_API_URL`**: backend base URL, e.g. `http://localhost:3010`.

### Database (once per machine / after clone)

From `backend/`:

```sh
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

The seed creates catalog data and a **development recruiter** account (see table below).

### Start servers (two terminals)

**Terminal 1 — API**

```sh
cd backend
npm run dev
```

**Terminal 2 — React**

```sh
cd frontend
npm install
npm start
```

### URLs and test user

| What | URL / value |
|------|-------------|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3010 |
| **Test username** | `recruiter` |
| **Test password** | `ChangeMe!Dev1` |

Use these after `npx prisma db seed`. Change the password in any shared environment.

### Production-style run (optional)

```sh
cd backend && npm run build && npm start
cd frontend && npm run build
# serve the `frontend/build` folder with a static server
```

## Database (local, beginner-friendly)

For a step-by-step explanation of PostgreSQL, Prisma, migrations, and seed data, see **[docs/LOCAL_DATABASE_GUIDE.md](docs/LOCAL_DATABASE_GUIDE.md)**.

## Backend (local, beginner-friendly)

For how Express, layers (controllers, services, repositories), sessions, uploads, and environment variables work in this project, see **[docs/LOCAL_BACKEND_GUIDE.md](docs/LOCAL_BACKEND_GUIDE.md)**.

## Frontend (local, beginner-friendly)

The React app includes recruiter **login**, **dashboard** with a prominent **Add candidate** action, and a **multi-section form** (contact data, education, work experience, CV upload) with **English/Spanish** UI, client-side validation, and accessible patterns. See **[docs/LOCAL_FRONTEND_GUIDE.md](docs/LOCAL_FRONTEND_GUIDE.md)**.

Copy `frontend/.env.example` to `frontend/.env.local` and set `REACT_APP_API_URL` to match your backend (default `http://localhost:3010`). The backend `FRONTEND_URL` must match the React dev server origin (usually `http://localhost:3000`) so **CORS and session cookies** work.

## Docker y PostgreSQL (optional)

If you **do not** already have PostgreSQL running, you can start it with Docker from the project root:

```sh
docker compose up -d
```

Connection settings match `docker-compose.yml` (user, password, database name). Use the same values in **`backend/.env`** inside **`DATABASE_URL`**.

If PostgreSQL is **already running** (local install or another container), you **do not** need `docker compose up`; just ensure `DATABASE_URL` points to that instance.

To stop only the Compose service: `docker compose down`.

# LTI - Sistema de Seguimiento de Talento  | ES

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
  - `prisma/`: Contiene el archivo de esquema de Prisma para ORM.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
  - `.env`: Contiene las variables de entorno.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `docker-compose.yml`: Contiene la configuración de Docker Compose para gestionar los servicios de tu aplicación.
- `README.md`: Este archivo contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript.
- El directorio `src` contiene el código fuente
- El directorio `prisma` contiene el esquema de Prisma.

## Cómo ejecutar la aplicación en local

### Requisitos previos

- **Node.js** y **npm** instalados.
- **PostgreSQL** accesible. Puedes:
  - arrancarlo con **Docker** desde este repositorio (`docker compose up -d`), **o**
  - usar una instancia **ya en ejecución** (mismo host/puerto/usuario/base que en `backend/.env`).

### Ficheros de entorno

1. **`backend/.env`** (plantilla en `backend/.env.example`):
   - **`DATABASE_URL`**: cadena **completa** de conexión. `dotenv` **no** expande `${VAR}`; escribe la URL explícita, p. ej.  
     `postgresql://LTIdbUser:TU_CONTRASEÑA@localhost:5432/LTIdb`
   - **`FRONTEND_URL`**: debe coincidir con el origen del servidor de desarrollo de React, normalmente `http://localhost:3000` (**CORS** y **cookies de sesión**).
   - **`SESSION_SECRET`**: cadena aleatoria larga para desarrollo local.
   - **`PORT`**: puerto del API (por defecto en código **3010** si no se define).

2. **`frontend/.env.local`** (copiar de `frontend/.env.example`):
   - **`REACT_APP_API_URL`**: URL base del backend, p. ej. `http://localhost:3010`.

### Base de datos (una vez por máquina / tras clonar)

Desde `backend/`:

```sh
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

El seed crea datos de catálogo y un **usuario reclutador de desarrollo** (tabla siguiente).

### Arrancar servidores (dos terminales)

**Terminal 1 — API**

```sh
cd backend
npm run dev
```

**Terminal 2 — React**

```sh
cd frontend
npm install
npm start
```

### URLs y usuario de prueba

| Qué | URL / valor |
|-----|-------------|
| **Frontend** | http://localhost:3000 |
| **API backend** | http://localhost:3010 |
| **Usuario de prueba** | `recruiter` |
| **Contraseña de prueba** | `ChangeMe!Dev1` |

Válidos tras `npx prisma db seed`. Cambia la contraseña en entornos compartidos.

### Ejecución tipo producción (opcional)

```sh
cd backend && npm run build && npm start
cd frontend && npm run build
# servir la carpeta `frontend/build` con un servidor estático
```

## Base de datos (local, guía didáctica)

Explicación paso a paso de PostgreSQL, Prisma, migraciones y datos iniciales: **[docs/LOCAL_DATABASE_GUIDE.md](docs/LOCAL_DATABASE_GUIDE.md)** (en inglés, convención del proyecto).

## Backend (local, guía didáctica)

Express, capas (controladores, servicios, repositorios), sesiones, subida de ficheros y variables de entorno: **[docs/LOCAL_BACKEND_GUIDE.md](docs/LOCAL_BACKEND_GUIDE.md)** (en inglés, convención del proyecto).

## Frontend (local, guía didáctica)

Login de reclutador, panel con CTA para **añadir candidato**, formulario completo (contacto, formación, experiencia, CV), textos **EN/ES**, validación en cliente y buenas prácticas de accesibilidad: **[docs/LOCAL_FRONTEND_GUIDE.md](docs/LOCAL_FRONTEND_GUIDE.md)**.

Copia `frontend/.env.example` a `frontend/.env.local` y define `REACT_APP_API_URL` igual que la URL del backend (por defecto `http://localhost:3010`). En el backend, `FRONTEND_URL` debe coincidir con el origen de React (normalmente `http://localhost:3000`) para **CORS y cookies de sesión**.

## Docker y PostgreSQL (opcional)

Si **no** tienes ya PostgreSQL en marcha, puedes levantarlo con Docker desde la raíz del proyecto:

```sh
docker compose up -d
```

Los parámetros de conexión coinciden con `docker-compose.yml`. Usa los mismos valores en **`backend/.env`** dentro de **`DATABASE_URL`**.

Si PostgreSQL **ya está arrancado** (instalación local u otro contenedor), **no** hace falta `docker compose up`; basta con que `DATABASE_URL` apunte a esa instancia.

Para parar solo el servicio de Compose: `docker compose down`.
