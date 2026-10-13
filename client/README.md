# DevConnect Client (`@devconnect/client`)

The frontend of DevConnect is a high-performance Single Page Application (SPA) built with **React 18**, **Vite**, **Tailwind CSS**, and configured as an installable **Progressive Web App (PWA)**.

---

## 🚀 Key Features

* **Authentication UI:** Clean Login and Register forms with inline validation and seamless GitHub OAuth handoff.
* **Developer Profile:** Hero section, avatar upload with client-side canvas image optimization, editable bio and location, skill tags with live endorsement counts, and portfolio project cards.
* **Developer Discovery:** Real-time filterable search across developer names, tech skills, and locations with server-side pagination.
* **Social Connections:** Incoming/outgoing connection requests management, mutual connections calculation, and connections directory.
* **Skill Endorsements:** One-click '+1' endorsements between connected peers with instant status feedback.
* **Technical Blog:** Full markdown article viewing and side-by-side live editor with syntax highlighting using `react-markdown` and `rehype-highlight`.
* **Activity Dashboard:** Unified developer feed of connected users' posts, trending posts, skill recommendations, and personal metrics.
* **Real-time Notifications:** Socket.io client receiving live toast notifications for connection requests and skill endorsements without polling.
* **Installable PWA:** Configured with `vite-plugin-pwa` and Workbox caching for offline asset performance.

---

## 📁 Architecture & Folder Structure

```
client/
├── public/
│   └── icon.svg              # App icon for PWA manifest
├── src/
│   ├── pages/
│   │   ├── Auth.tsx          # Login & Register views
│   │   ├── Blog.tsx          # Blog feed, reader, and live markdown editor
│   │   ├── Dashboard.tsx     # Metrics, activity feed, and recommendations
│   │   ├── Network.tsx       # Connection requests & list
│   │   ├── Profile.tsx       # User profile, skills, projects, and avatar upload
│   │   └── Search.tsx        # Developer discovery with filters & pagination
│   ├── api.ts                # Type-safe fetch wrapper unwrapping ApiResponse<T>
│   ├── api.test.ts           # Vitest tests for api client
│   ├── App.tsx               # Main routing, Shell layout, Socket.io listener
│   ├── index.css             # Tailwind directives & global utility classes
│   ├── main.tsx              # React Query provider & DOM bootstrap
│   ├── store.ts              # Zustand store for toasts and mobile UI
│   └── store.test.ts         # Unit tests for Zustand store
├── index.html                # HTML entry point with viewport and PWA tags
├── package.json
├── tailwind.config.js
└── vite.config.ts            # Vite build, PWA manifest, and reverse proxy
```

---

## 🛠 State Management Architecture

* **Server State (TanStack Query):**
  * Manages all backend asynchronous data (`['me']`, `['user', username]`, `['connections']`, `['posts']`, `['dashboard']`).
  * Provides caching, request deduplication, and automatic query invalidation upon successful mutations.
* **Client State (Zustand):**
  * Lightweight store (`useUI`) managing mobile hamburger navigation and the global ephemeral toast notification queue.

---

## 💻 Available Scripts

* `npm run dev`: Starts Vite dev server at `http://localhost:5173` with proxy to backend.
* `npm run build`: Runs TypeScript verification (`tsc --noEmit`) and creates an optimized production bundle in `dist/`.
* `npm run preview`: Previews the production build locally.
* `npm run test`: Runs client automated unit tests via **Vitest**.
