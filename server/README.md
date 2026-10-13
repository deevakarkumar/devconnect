# DevConnect Server (`@devconnect/server`)

The backend of DevConnect is a secure, type-safe RESTful API and real-time WebSocket server built with **Node.js**, **Express.js**, **TypeScript**, **Prisma ORM**, and **Socket.io**.

---

## 🚀 Key Features

* **Authentication:** Dual-mode authentication supporting local email/password registration with **Bcrypt** (10 salt rounds) and **GitHub OAuth 2.0**.
* **Session Management:** Signed JWTs stored in `httpOnly`, `sameSite`, and secure cookies to protect against XSS and CSRF.
* **Database & ORM:** Relational data persistence with **PostgreSQL** using **Prisma ORM**, complete with composite unique constraints, cascade deletion rules, and type generation.
* **Real-time Notifications:** WebSockets with **Socket.io**, authenticating socket handshakes via session cookies and distributing targeted events to private `user:<userId>` rooms.
* **File Uploads:** In-memory file processing via **Multer** and secure CDN storage via **Cloudinary**, applying automatic square cropping transformations (400x400) and enforcing a 2MB maximum limit.
* **API Standardization:** All endpoints enforce a strict response envelope: `{ success: boolean, data: T, message: string }`.
* **Input Validation:** Request bodies are strictly parsed using **Zod** schemas before reaching controllers or database transactions.
* **Defensive Security:** Protected by **Helmet** security headers, strict CORS origin whitelisting, and rate limiting on sensitive authentication routes.

---

## 📁 Architecture & Folder Structure

```
server/
├── prisma/
│   ├── schema.prisma         # PostgreSQL models, relations, constraints
│   └── seed.ts               # Sample database population script
├── src/
│   ├── routes/
│   │   ├── auth.ts           # /api/auth: register, login, logout, me, github
│   │   ├── users.ts          # /api/users: search, profile CRUD, avatar, skills, projects
│   │   ├── blog.ts           # /api/posts: Markdown posts CRUD & view counter
│   │   └── social.ts         # /api: connections, endorsements, notifications, dashboard
│   ├── app.ts                # Express app configuration & middleware pipeline
│   ├── index.ts              # HTTP server bootstrap & Socket.io initialization
│   ├── lib.ts                # Prisma client, auth guard, envelope helpers, Socket.io emitter
│   ├── health.test.ts        # Health check and basic route guard tests
│   └── routes.test.ts        # Route validation, Zod schemas, and security tests
├── package.json
└── tsconfig.json
```

---

## 🛠 Available Scripts

* `npm run dev`: Starts Express development server with live TypeScript reloading using `tsx watch`.
* `npm start`: Runs the production server using `tsx src/index.ts`.
* `npm run build`: Type-checks the server code (`tsc --noEmit`).
* `npm test`: Runs automated integration tests with **Jest** and **Supertest**.
* `npm run migrate`: Runs `prisma migrate dev` to generate and apply migrations.
* `npm run seed`: Executes `prisma/seed.ts` to populate the database with realistic sample developers, projects, and articles.

---

## 🔑 Environment Variables Reference

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Neon PostgreSQL pooled connection URI | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret key used to sign session JWTs | `super-secret-jwt-key` |
| `CLIENT_URL` | Frontend client URL for CORS and redirects | `http://localhost:5173` |
| `PORT` | API server listen port (default: 4000) | `4000` |
| `GITHUB_CLIENT_ID` | GitHub OAuth application Client ID | `Iv1.abc...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth application Client Secret | `123456...` |
| `GITHUB_CALLBACK_URL` | Registered GitHub OAuth redirect URL | `http://localhost:4000/api/auth/github/callback` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud identifier | `devconnect-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `1234567890` |
| `CLOUDINARY_API_SECRET`| Cloudinary API Secret | `abcdef123456` |
