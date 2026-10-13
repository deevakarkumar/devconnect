# DevConnect — Developer Networking & Portfolio Platform

> **Code A Nova • Full Stack Development Internship Program 2026**  
> Approved by HR Project Brief Implementation

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**DevConnect** is a modern, full-stack developer networking platform where engineers can build rich portfolios, showcase projects, publish technical blog posts with markdown syntax highlighting, discover peers through skill and location filters, connect bidirectionally, endorse skills, and receive real-time notifications over WebSockets.

---

## 📑 Deliverables Index

| # | Deliverable | Documentation / Location |
| :--- | :--- | :--- |
| **1** | Monorepo Source Code & Package READMEs | Root repository, [`client/README.md`](client/README.md), [`server/README.md`](server/README.md), [`shared/README.md`](shared/README.md) |
| **2** | Deployment Architecture & URLs | [Deployment Guide](#-deployment--live-service-configuration) |
| **3** | Database Schema Diagram & API Documentation | [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) & [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) |
| **4** | End-to-End User Flow Diagrams | [`docs/USER_FLOWS.md`](docs/USER_FLOWS.md) |
| **5** | Automated Test Results Report | [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) (18/18 tests passing) |
| **6** | 7-Minute Live Demo & Walkthrough Script | [`docs/DEMO_WALKTHROUGH.md`](docs/DEMO_WALKTHROUGH.md) |

---

## 🛠 Tech Stack Overview

| Category | Technology | Rationale & Usage |
| :--- | :--- | :--- |
| **Monorepo** | npm Workspaces | Shared TypeScript contracts and single-command orchestration |
| **Frontend** | React 18+, Vite, Tailwind CSS | Fast rendering, responsive layout, atomic utility classes |
| **Backend** | Node.js, Express.js (TypeScript) | Type-safe RESTful API, rate-limiting, and middleware security |
| **Database** | PostgreSQL, Prisma ORM | Relational social graph, composite constraints, migrations |
| **Authentication** | JWT (httpOnly) + GitHub OAuth 2.0 | Dual-mode credential and OAuth authentication |
| **File Storage** | Cloudinary CDN (Free tier) + Multer | In-memory upload with client-side canvas pre-compression (< 2MB) |
| **Real-time** | Socket.io | Bidirectional push notifications for requests & endorsements |
| **State Management**| TanStack React Query + Zustand | Clean separation: React Query (server cache) & Zustand (UI) |
| **PWA** | Vite PWA + Workbox | Offline asset caching, installable mobile/desktop app manifest |
| **Testing** | Vitest (Client) + Jest & Supertest (Server)| Comprehensive test suites across frontend and backend |

---

## 🏛 Architecture & Data Flow

```mermaid
graph TD
    subgraph Client ["Client (/client - React 18 SPA + PWA)"]
        UI[Tailwind UI Components]
        ZustandStore[Zustand UI State\nToasts & Menus]
        ReactQuery[TanStack React Query\nServer Cache & Mutations]
        SocketClient[Socket.io Client\nReal-time Event Listener]
    end

    subgraph Shared ["Shared (/shared)"]
        Types[TypeScript Types & DTOs\nApiResponse, User, Skill, BlogPost]
    end

    subgraph Server ["Server (/server - Express TypeScript API)"]
        Middleware[Auth Guard + Helmet + Rate Limit]
        Controllers[Auth, Users, Blog, Social Routes]
        SocketServer[Socket.io Server\nPrivate user:ID rooms]
        Prisma[Prisma ORM Client]
    end

    subgraph Infrastructure ["External Cloud Services (Free Tier)"]
        Postgres[(PostgreSQL Database\nNeon Serverless)]
        Cloudinary[(Cloudinary CDN\nImage Transformations)]
        GitHubOAuth[GitHub OAuth API]
    end

    UI --> ReactQuery
    UI --> ZustandStore
    ReactQuery --> Types
    Controllers --> Types
    ReactQuery <-->|REST API JSON Envelope| Middleware
    Middleware --> Controllers
    SocketClient <-->|WebSocket Events| SocketServer
    Controllers --> Prisma
    Prisma <--> Postgres
    Controllers <--> Cloudinary
    Controllers <--> GitHubOAuth
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
* **Node.js** v20+ installed
* **PostgreSQL** database (e.g., free tier instance on [Neon](https://neon.tech))
* (Optional) **Cloudinary** free account and **GitHub OAuth App**

### 2. Clone and Install
```bash
git clone https://github.com/codeanova/devconnect.git
cd devconnect
npm install
```

### 3. Environment Configuration
Create `server/.env` based on `.env.example`:
```env
DATABASE_URL=postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=super-secret-jwt-key-devconnect-2026
CLIENT_URL=http://localhost:5173
PORT=4000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/auth/github/callback
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:4000
```

### 4. Database Migration & Realistic Seeding
Run database migrations and populate realistic developer accounts, projects, skills, blog posts, connections, and endorsements:
```bash
# Push schema migrations
npm run migrate -w server -- --name init

# Seed database with sample data
npm run seed
```

### 5. Start Development Servers
Open two terminal windows:
```bash
# Terminal 1: Backend API on port 4000
npm run dev:server

# Terminal 2: Frontend Vite dev server on port 5173
npm run dev:client
```
Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Testing

Execute full monorepo test suites across both backend and frontend:
```bash
npm test
```
* **Backend:** Runs Jest and Supertest suites (`server/src/*.test.ts`)
* **Frontend:** Runs Vitest test suites (`client/src/*.test.ts`)

To test workspaces individually:
```bash
npm test -w server
npm test -w client
```

---

## 🌐 Deployment & Live Service Configuration

### Free-Tier Deployment Stack:
1. **Database:** [Neon](https://neon.tech) (Serverless PostgreSQL)
   * Create database project and copy the pooled connection string into `DATABASE_URL`.
2. **Backend API:** [Railway](https://railway.app)
   * Connect repository, set root directory to `server`.
   * **Build Command:** `npm install && npx prisma migrate deploy`
   * **Start Command:** `npm start`
   * **Environment Variables:** Set `NODE_ENV=production`, `PORT=4000`, `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL=<Vercel Frontend URL>`, `GITHUB_CALLBACK_URL=<Railway API URL>/api/auth/github/callback`.
3. **Frontend SPA & PWA:** [Vercel](https://vercel.com)
   * Root directory: `client`
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
   * **Environment Variable:** `VITE_API_URL=<Railway API URL>`
   * Single-Page Application (SPA) routing is configured via `vercel.json` rewrites.

---

## 📦 Monorepo Workspace Structure

```
devconnect/
├── client/                 # React 18 SPA + Vite + Tailwind + PWA
│   ├── public/             # Static assets & PWA icons
│   ├── src/
│   │   ├── pages/          # Auth, Dashboard, Profile, Blog, Network, Search
│   │   ├── api.ts          # Unified fetch wrapper with envelope unwrapping
│   │   ├── App.tsx         # Route tree, Shell layout, Socket.io listener
│   │   ├── store.ts        # Zustand UI store
│   │   └── main.tsx        # React Query provider & DOM root
│   ├── README.md           # Client package documentation
│   └── vite.config.ts      # Vite & PWA Service Worker config
│
├── server/                 # Express.js + TypeScript + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma   # PostgreSQL data models & relations
│   │   └── seed.ts         # Sample data seeder
│   ├── src/
│   │   ├── routes/         # auth.ts, users.ts, blog.ts, social.ts
│   │   ├── app.ts          # Express app middleware & route bindings
│   │   ├── index.ts        # HTTP server & Socket.io initialization
│   │   └── lib.ts          # Prisma client, auth guard, helpers
│   ├── README.md           # Server package documentation
│   └── tsconfig.json
│
├── shared/                 # Shared TypeScript contracts & DTOs
│   ├── src/
│   │   └── index.ts        # ApiResponse, User, Project, BlogPost, Skill
│   ├── README.md           # Shared package documentation
│   └── package.json
│
├── docs/                   # Formal internship project deliverables
│   ├── DATABASE_SCHEMA.md  # Mermaid ER diagram & model specifications
│   ├── API_DOCUMENTATION.md# REST & WebSocket API specification
│   ├── USER_FLOWS.md       # Mermaid sequence & user journeys
│   ├── TEST_REPORT.md      # Automated test suites & security review
│   └── DEMO_WALKTHROUGH.md # 7-minute live presentation script
│
├── package.json            # Monorepo workspaces configuration
└── README.md               # Main project documentation
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
