# DevConnect — 7-Minute Live Demo & Walkthrough Script

## Presentation Overview
* **Project Name:** DevConnect — Developer Networking & Portfolio Platform
* **Presenter:** Full Stack Engineering Intern
* **Target Duration:** 7:00 Minutes (Timed)
* **Goal:** Demonstrate end-to-end full-stack capabilities, architecture decisions, and live feature execution according to the Code A Nova project rubric.

---

## Minute-by-Minute Demo Script

```
00:00 - 01:00  [1. Introduction & Monorepo Architecture]
01:00 - 02:15  [2. Authentication & Developer Profile Management]
02:15 - 03:30  [3. Developer Discovery, Search & Connection Graph]
03:30 - 04:45  [4. Skill Endorsements & Real-Time Socket.io Notifications]
04:45 - 05:45  [5. Technical Blog System with Markdown & Syntax Highlighting]
05:45 - 06:30  [6. Unified Dashboard, Activity Feed & PWA Capabilities]
06:30 - 07:00  [7. Conclusion, Automated Test Verification & Q&A Transition]
```

---

### Segment 1: Introduction & Monorepo Architecture (0:00 – 1:00)
* **Action:** Display root project repository in terminal / editor, then show `localhost:5173`.
* **Talking Points:**
  * *"Hello evaluators. Today I am presenting **DevConnect**, a complete developer networking and portfolio platform built with a high-performance, modern full-stack architecture."*
  * *"The project is organized as an npm workspaces monorepo: `/client` contains our React 18 SPA powered by Vite, Tailwind CSS, TanStack React Query, and Zustand. `/server` is an Express TypeScript REST and WebSocket API integrated with Prisma ORM and PostgreSQL. `/shared` holds the centralized TypeScript contract and DTOs that prevent API drift between frontend and backend."*
  * *"Every API response adheres to a strict envelope contract: `{ success, data, message }`."*

---

### Segment 2: Authentication & Profile Management (1:00 – 2:15)
* **Action:**
  1. Navigate to `/register`.
  2. Register a new developer account (`alex_dev`).
  3. Show seamless transition to `/dashboard` via httpOnly JWT cookie.
  4. Navigate to `/u/alex_dev` and click "Edit profile".
  5. Add bio, location, upload an avatar (show client-side canvas compression in DevTools Network tab), and add skills like `TypeScript` and `React`.
  6. Add a portfolio project with tech stack tags and live/repo links.
* **Talking Points:**
  * *"For authentication, we support both local registration and GitHub OAuth 2.0. Passwords are securely hashed using Bcrypt with 10 salt rounds. Sessions are preserved via signed JWTs stored in `httpOnly`, `sameSite`, and secure cookies, preventing client-side script access."*
  * *"On the profile page, image uploads utilize client-side canvas optimization to resize and compress photos before transmitting them to Cloudinary CDN via Multer memory storage, keeping uploads well under our 2MB limit."*

---

### Segment 3: Developer Discovery & Connection Graph (2:15 – 3:30)
* **Action:**
  1. Click **Discover** (`/search`).
  2. Type "PostgreSQL" in the skill filter to demonstrate instant debounced search.
  3. Filter by location (e.g. "Seattle").
  4. Click on `Sarah Chen`'s profile (`/u/sarah_cloud`).
  5. Point out the mutual connections indicator.
  6. Click the **Connect** button.
* **Talking Points:**
  * *"Our discovery engine enables real-time search across developer names, usernames, tech stacks, and locations with server-side pagination."*
  * *"Our social graph uses a bidirectional connection model in PostgreSQL with unique constraints. The system dynamically computes mutual connections between any two developers using optimized Prisma queries."*

---

### Segment 4: Skill Endorsements & Real-Time Socket.io Notifications (3:30 – 4:45)
* **Action:**
  1. Open a second browser window (incognito or second browser profile) logged in as `Sarah Chen`.
  2. Show Sarah's screen receiving an instant toast: *"Alex Rivera sent you a connection request"*, and the notification bell incrementing in real-time.
  3. In Sarah's window, navigate to **Network** (`/network`) and click **Accept**.
  4. Show Alex's screen immediately receiving the *"Sarah Chen accepted your request"* real-time notification via Socket.io.
  5. Now that they are connected, Alex visits Sarah's profile. Point out that the '+1' endorsement buttons are now active.
  6. Alex clicks '+1' to endorse Sarah's `PostgreSQL` skill.
  7. Show Sarah's screen instantly receiving the endorsement notification and her endorsement counter updating.
* **Talking Points:**
  * *"Here you see our real-time notification engine in action. Our WebSocket server authenticates the handshake via the session cookie and assigns each user to a private channel `user:{userId}`."*
  * *"Notice our business rule enforcement: only confirmed connections can endorse skills, and each user can only endorse a particular skill once. The unique constraint `@@unique([skillId, endorserId])` prevents duplicate endorsements at the database level."*

---

### Segment 5: Technical Blog System (4:45 – 5:45)
* **Action:**
  1. Click **Blog** -> **Write post** (`/blog/new`).
  2. Type a title and paste markdown with headers and a TypeScript code block.
  3. Show the live side-by-side preview powered by `rehype-highlight` with syntax highlighting.
  4. Click **Publish**.
  5. Open the published post. Refresh and show the atomic view counter incrementing.
* **Talking Points:**
  * *"The blog system allows developers to share technical knowledge with full GitHub Flavored Markdown and code syntax highlighting."*
  * *"When viewing a single post, our backend atomically increments the view count in a single query, preventing concurrency race conditions."*

---

### Segment 6: Dashboard & PWA Capabilities (5:45 – 6:30)
* **Action:**
  1. Navigate to **Dashboard** (`/dashboard`).
  2. Point out the dynamic metrics: Connection count, Posts published, Total endorsements.
  3. Show the Activity Feed populated with recent posts from connected peers.
  4. Highlight the "People you may know" recommendation engine matching developers by shared skills.
  5. Open Chrome DevTools Application tab -> Service Workers to demonstrate the Progressive Web App (PWA) manifest and Workbox caching.
* **Talking Points:**
  * *"The dashboard unifies the developer experience with aggregated stats, curated feed items from connected developers, and intelligent suggestions matching developers with overlapping skill sets."*
  * *"DevConnect is also an installable Progressive Web App with an offline-first Workbox service worker caching static assets and API requests."*

---

### Segment 7: Test Verification & Conclusion (6:30 – 7:00)
* **Action:**
  1. Open terminal and run `npm test`.
  2. Show all 18 automated tests passing across both Jest and Vitest suites.
  3. Summarize key achievements.
* **Talking Points:**
  * *"To ensure software reliability, we have 18 automated unit and integration tests passing across Jest and Vitest, validating authentication guards, input schemas, and state stores."*
  * *"All 15 days of milestones have been achieved: monorepo architecture, Neon PostgreSQL with Prisma, JWT & GitHub OAuth, Cloudinary upload, real-time Socket.io notifications, and PWA readiness."*
  * *"Thank you, and I am now ready for your questions!"*

---

## Anticipated Q&A Guide

### Q1: How do you prevent unauthorized users from endorsing skills?
* **Answer:** *"We enforce a multi-tier check: first, our `auth` middleware verifies the JWT signature and extracts `userId`. Second, the route queries the `Connection` table to ensure an `ACCEPTED` status exists between the two users. Finally, the database enforces a composite unique key `[skillId, endorserId]` so duplicate endorsements are impossible."*

### Q2: Why did you choose React Query (TanStack Query) alongside Zustand?
* **Answer:** *"We strictly separate server state from client state. React Query manages all asynchronous server state — handling caching, deduplication, automatic invalidation when mutations succeed, and background refetching. Zustand handles purely client-side UI state, such as mobile navigation menus and the temporary toast notification queue. This keeps our state predictable and lightweight."*

### Q3: How is WebSocket authentication handled securely?
* **Answer:** *"During the Socket.io handshake, our server middleware parses the `cookie` header, extracts the `token` cookie, and validates the JWT against `JWT_SECRET`. If invalid or expired, the connection is rejected immediately. Once verified, the socket joins room `user:{userId}`, ensuring notifications are private and targeted."*
