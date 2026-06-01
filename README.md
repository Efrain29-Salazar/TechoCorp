# TechCorp PRO v1.1 — Plataforma de Gestión de Equipos Tecnológicos

Sistema empresarial con Arquitectura Hexagonal, PostgreSQL + MongoDB, JWT y portal de clientes con catálogo de ventas.

---

## Arquitectura Hexagonal

```
backend/src/
├── domain/                     # Núcleo del negocio (sin dependencias externas)
│   ├── entities/               # Usuario, Equipo, Cliente
│   └── repositories/           # Interfaces: IUsuarioRepository, IEquipoRepository,
│                               #             ITicketRepository, IClienteRepository
│
├── application/                # Casos de uso
│   └── use-cases/
│       ├── auth/               # LoginUseCase, RegisterUseCase (admin)
│       ├── equipos/            # EquipoUseCases
│       ├── tickets/            # TicketUseCases
│       └── clientes/           # ClienteRegisterUseCase, ClienteLoginUseCase
│
├── infrastructure/             # Adaptadores externos
│   ├── controllers/            # auth, equipo, ticket, cliente, stock, dashboard, asistente, reporte
│   ├── routes/                 # Una ruta por dominio
│   └── database/
│       ├── postgresql/         # Prisma: usuarios, equipos, clientes, stock_archivos
│       └── mongodb/            # Mongoose: tickets, logs, chats
│
└── shared/                     # authMiddleware, clienteMiddleware, response helpers
```

---

## Stack Tecnológico

| Capa           | Tecnología                                        |
|----------------|---------------------------------------------------|
| Backend        | Node.js 20 + Express 4                            |
| ORM (PG)       | Prisma 5 + PostgreSQL 15                          |
| ODM (Mongo)    | Mongoose 8 + MongoDB 7                            |
| Auth Admin     | JWT (jsonwebtoken) + bcryptjs                     |
| Auth Cliente   | JWT separado con middleware propio                |
| Subida PDF     | Multer (hasta 30 MB por archivo)                  |
| PDF Reporte    | PDFKit                                            |
| Frontend       | React 18 + Vite + React Router                    |
| Gráficas       | Chart.js + react-chartjs-2                        |
| Docker         | docker-compose (PG + Mongo + Backend + Frontend)  |

---

## Instalación Local (VS Code)

### Requisitos
- Node.js 18+
- PostgreSQL 14+ corriendo en puerto 5432
- MongoDB corriendo en puerto 27017

### 1. Abrir en VS Code

```bash
tar -xzf techcorp-pro.tar.gz
code techcorp-pro
```

### 2. Configurar Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL y MongoDB
npm install
```

Contenido recomendado de `.env`:
```
PORT=3000
DATABASE_URL="postgresql://postgres:1234@localhost:5432/techcorp"
MONGO_URI="mongodb://localhost:27017/techcorp"
JWT_SECRET="techcorp_super_secret_2024"
NODE_ENV=development
```

### 3. Crear base de datos y migrar

```bash
# Crea la base de datos en PostgreSQL primero:
# (En psql): CREATE DATABASE techcorp;

# Luego ejecuta la migración Prisma:
npx prisma migrate dev --name init

# Genera el cliente Prisma:
npx prisma generate
```

### 4. Cargar datos de prueba

```bash
npm run seed
```

Crea los siguientes usuarios:

| Tipo     | Correo                    | Contraseña    | Portal              |
|----------|---------------------------|---------------|---------------------|
| Admin    | admin@techcorp.com        | admin123      | /login              |
| Técnico  | tecnico@techcorp.com      | tecnico123    | /login              |
| Cliente  | cliente@empresa.com       | cliente123    | /portal             |

### 5. Iniciar Backend

```bash
npm run dev
# → http://localhost:3000
```

### 6. Iniciar Frontend

```bash
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

### 7. Portales de acceso

| Portal              | URL                                  | Para quién             |
|---------------------|--------------------------------------|------------------------|
| Panel Administrador | http://localhost:5173/login          | Admins y técnicos      |
| Portal de Clientes  | http://localhost:5173/portal         | Clientes externos      |

---

## Opción Docker Compose

```bash
# En la raíz del proyecto
docker compose up --build

# Con seed (después del primer arranque):
docker compose exec backend npm run seed
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3000

---

## API REST — Endpoints Completos

### Autenticación Admin
| Método | Endpoint              | Auth       |
|--------|-----------------------|------------|
| POST   | /api/auth/login       | Pública    |
| POST   | /api/auth/register    | Pública    |
| GET    | /api/auth/usuarios    | Admin JWT  |
| DELETE | /api/auth/usuarios/:id| Admin JWT  |

### Portal Clientes
| Método | Endpoint                    | Auth              |
|--------|-----------------------------|-------------------|
| POST   | /api/clientes/register      | Pública           |
| POST   | /api/clientes/login         | Pública           |
| GET    | /api/clientes/perfil        | Cliente JWT       |
| GET    | /api/clientes/stock         | Cliente JWT       |
| GET    | /api/clientes/catalogos     | Cliente JWT       |
| GET    | /api/clientes/admin/lista   | Admin JWT         |
| DELETE | /api/clientes/admin/:id     | Admin JWT         |

### Equipos (PostgreSQL)
| Método | Endpoint                          |
|--------|-----------------------------------|
| GET    | /api/equipos                      |
| POST   | /api/equipos                      |
| PUT    | /api/equipos/:id                  |
| DELETE | /api/equipos/:id                  |
| POST   | /api/equipos/:id/mantenimientos   |
| GET    | /api/equipos/:id/mantenimientos   |

### Tickets (MongoDB)
| Método | Endpoint                  |
|--------|---------------------------|
| GET    | /api/tickets              |
| POST   | /api/tickets              |
| PUT    | /api/tickets/:id          |
| DELETE | /api/tickets/:id          |
| POST   | /api/tickets/:id/notas    |
| PATCH  | /api/tickets/:id/resolver |

### Stock / Catálogos PDF (Admin)
| Método | Endpoint                          | Descripción                        |
|--------|-----------------------------------|------------------------------------|
| POST   | /api/stock/upload                 | Subir PDF de catálogo (multipart)  |
| GET    | /api/stock/catalogos              | Listar catálogos                   |
| GET    | /api/stock/catalogos/:id/download | Descargar PDF                      |
| DELETE | /api/stock/catalogos/:id          | Eliminar catálogo                  |
| GET    | /api/stock/equipos                | Equipos en stock                   |
| PATCH  | /api/stock/equipos/:id            | Configurar precio y disponibilidad |

### Dashboard, Asistente, Reportes
| Método | Endpoint              | Descripción                |
|--------|-----------------------|----------------------------|
| GET    | /api/dashboard/resumen| KPIs combinados PG+Mongo   |
| POST   | /api/asistente/mensaje| Chatear con el asistente   |
| GET    | /api/reportes/pdf     | Reporte PDF descargable    |

---

## Funcionalidades

### Panel Administrador (http://localhost:5173/login)
- **Dashboard** — KPIs en tiempo real (equipos, tickets, mantenimientos)
- **Equipos** — CRUD completo + historial de mantenimientos
- **Tickets** — CRUD MongoDB + notas + cambio de estado
- **Analítica** — 4 gráficas con Chart.js
- **Asistente Técnico** — Chatbot con base de conocimiento
- **Stock / Catálogos** — Subir PDFs de catálogos + configurar equipos en venta con precio
- **Clientes** — Ver y eliminar clientes registrados
- **Usuarios** — Gestión de cuentas admin/técnico

### Portal de Clientes (http://localhost:5173/portal)
- **Registro con email** — nombre, correo, contraseña, teléfono, empresa
- **Inicio de sesión** — JWT propio independiente del admin
- **Ver equipos en stock** — Tarjetas con precio, descripción e ícono por tipo
- **Descargar catálogos PDF** — Solo los catálogos publicados por el admin

### Stock y Ventas (Admin)
- Marcar cualquier equipo como "disponible para venta"
- Agregar precio de venta y descripción comercial por equipo
- Subir archivos PDF de catálogos (hasta 30 MB) con drag & drop
- Los catálogos son visibles inmediatamente para los clientes registrados
- Eliminar catálogos (borra el archivo físico del servidor)

---

## Modelos de Base de Datos

### PostgreSQL (Prisma)
```
usuarios     → id, nombre, correo, password, rol, activo
clientes     → id, nombre, correo, password, telefono, empresa, activo
pedidos      → id, clienteId, descripcion, estado
equipos      → id, nombre, tipo, marca, modelo, serial, estado,
                ubicacion, enStock, precio, descripcionVenta
mantenimientos → id, equipoId, descripcion, tipo, tecnico, costo, fecha
stock_archivos → id, nombre, descripcion, rutaArchivo, subidoPor, activo
reportes     → id, titulo, tipo, contenido
```

### MongoDB (Mongoose)
```
tickets      → titulo, descripcion, prioridad, estado, notas[], fecha
chatasistenets → sesionId, usuario, mensajes[]
logs         → nivel, accion, detalle, usuario, ip, fecha
```

---

## Comandos útiles

```bash
# Backend
npm run dev                              # Desarrollo (nodemon)
npm run seed                             # Datos de prueba
npx prisma studio                        # UI visual PostgreSQL
npx prisma migrate dev --name <nombre>  # Nueva migración

# Frontend
npm run dev          # Servidor de desarrollo (port 5173)
npm run build        # Build producción

# Docker
docker compose up --build                # Todo el sistema
docker compose exec backend npm run seed # Seed dentro de Docker
docker compose down -v                   # Parar y borrar volúmenes
```

---

## Estructura de Archivos Clave

```
techcorp-pro/
├── backend/
│   ├── src/
│   │   ├── domain/entities/          # Usuario.js, Equipo.js, Cliente.js
│   │   ├── domain/repositories/      # I*Repository.js (interfaces)
│   │   ├── application/use-cases/    # Casos de uso por dominio
│   │   ├── infrastructure/
│   │   │   ├── controllers/          # 8 controladores
│   │   │   ├── routes/               # 8 archivos de rutas
│   │   │   └── database/
│   │   │       ├── postgresql/       # PrismaClient + repositorios
│   │   │       └── mongodb/          # Mongoose models + repositorios
│   │   ├── shared/                   # authMiddleware, clienteMiddleware, response
│   │   └── main.js                   # Servidor Express
│   ├── prisma/schema.prisma          # Esquema PostgreSQL
│   ├── uploads/                      # PDFs subidos (se crea automáticamente)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── context/                  # AuthContext, ClienteContext
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Login admin
│   │   │   ├── Dashboard.jsx         # Panel principal
│   │   │   ├── Equipos.jsx           # CRUD equipos
│   │   │   ├── Tickets.jsx           # CRUD tickets
│   │   │   ├── Analitica.jsx         # Gráficas Chart.js
│   │   │   ├── Asistente.jsx         # Chatbot técnico
│   │   │   ├── StockAdmin.jsx        # Catálogos PDF + equipos en venta
│   │   │   ├── Clientes.jsx          # Lista de clientes
│   │   │   ├── Usuarios.jsx          # Gestión usuarios admin
│   │   │   ├── PortalCliente.jsx     # Login/Registro de clientes
│   │   │   └── ClienteInicio.jsx     # Dashboard del cliente
│   │   ├── services/api.js           # Todas las llamadas a la API
│   │   └── App.jsx                   # Rutas y estructura
│   └── package.json
│
└── docker-compose.yml
```
