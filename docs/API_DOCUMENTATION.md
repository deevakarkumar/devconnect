# DevConnect — REST API & WebSocket Documentation

## Overview
The DevConnect API adheres to RESTful architectural principles with strict TypeScript typings, schema validation via **Zod**, and real-time bidirectional messaging powered by **Socket.io**.

All endpoints enforce an identical response envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Human readable status"
}
```

On validation or server failure:
```json
{
  "success": false,
  "data": null,
  "message": "Specific error explanation"
}
```

---

## Authentication & Security
* **Session Storage:** JWT tokens signed with `HS256` stored in an `httpOnly`, `sameSite`, and secure cookie (`token`).
* **Rate Limiting:** Global rate limiter applied on auth routes (`100 requests / 15 minutes`).
* **Security Headers:** `helmet()` enabled with secure CSP, HSTS, frameguard, and referrer headers.
* **CORS:** Restricted to `CLIENT_URL` with `credentials: true`.

---

## Endpoints Catalog

### 1. Health Check
* `GET /api/health`
  * **Auth:** None
  * **Description:** Service health check and uptime probe.
  * **Response (200):** `{ success: true, data: null, message: "ok" }`

---

### 2. Authentication (`/api/auth`)

#### Register User
* `POST /api/auth/register`
* **Auth:** None
* **Request Body:**
  ```json
  {
    "email": "user@domain.com",
    "password": "securepassword123",
    "name": "Alex Rivera",
    "username": "alex_dev"
  }
  ```
* **Validation:** Email format, Password >= 8 chars, Name >= 1 char, Username regex `^[a-z0-9_]{3,20}$`.
* **Response (201):** `{ success: true, data: { "id": "cuid..." }, message: "Registered" }`
* **Cookies:** Sets `token` httpOnly cookie (7 days expiry).

#### Login User
* `POST /api/auth/login`
* **Auth:** None
* **Request Body:**
  ```json
  {
    "email": "user@domain.com",
    "password": "securepassword123"
  }
  ```
* **Response (200):** `{ success: true, data: { "id": "cuid..." }, message: "Logged in" }`
* **Cookies:** Sets `token` httpOnly cookie.

#### Logout User
* `POST /api/auth/logout`
* **Auth:** None
* **Response (200):** `{ success: true, data: null, message: "Logged out" }`
* **Cookies:** Clears `token` cookie.

#### Current Authenticated User
* `GET /api/auth/me`
* **Auth:** Required
* **Response (200):** User profile details including email and public fields.

#### GitHub OAuth Initiate
* `GET /api/auth/github`
* **Description:** Redirects client to GitHub OAuth authorization screen with `read:user user:email` scopes.

#### GitHub OAuth Callback
* `GET /api/auth/github/callback?code=...`
* **Description:** Exchanges authorization code for GitHub access token, fetches GitHub profile & primary email, upserts user in DB, sets JWT cookie, and redirects to `${CLIENT_URL}/dashboard`.

---

### 3. Users & Developer Discovery (`/api/users`)

#### Search Developers (Paginated)
* `GET /api/users?q=...&skill=...&location=...&page=1`
* **Auth:** Required
* **Query Parameters:**
  * `q` *(optional)*: Matches name or username (case-insensitive).
  * `skill` *(optional)*: Matches exact skill name.
  * `location` *(optional)*: Matches user location.
  * `page` *(default: 1)*: 12 developers per page.
* **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "cuid...",
          "username": "sarah_cloud",
          "name": "Sarah Chen",
          "bio": "Cloud Architect...",
          "location": "Seattle, WA",
          "avatarUrl": "https://...",
          "skills": [{ "name": "PostgreSQL" }, { "name": "Docker" }]
        }
      ],
      "total": 45,
      "page": 1,
      "pages": 4
    },
    "message": "OK"
  }
  ```

#### Get Public Profile by Username
* `GET /api/users/:username`
* **Auth:** Required
* **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "id": "cuid...",
      "username": "sarah_cloud",
      "name": "Sarah Chen",
      "bio": "...",
      "location": "Seattle, WA",
      "avatarUrl": "https://...",
      "isMe": false,
      "mutualConnections": 3,
      "connection": { "id": "cuid...", "status": "ACCEPTED" },
      "skills": [
        {
          "id": "s-1",
          "name": "PostgreSQL",
          "_count": { "endorsements": 8 },
          "endorsements": [{ "id": "e-1" }]
        }
      ],
      "projects": [
        {
          "id": "p-1",
          "title": "KubeWatch",
          "description": "...",
          "techStack": ["Go", "Kubernetes"],
          "liveUrl": "https://...",
          "repoUrl": "https://..."
        }
      ]
    },
    "message": "OK"
  }
  ```

#### Update Profile
* `PUT /api/users/me`
* **Auth:** Required
* **Request Body:** `{ "name": "...", "bio": "...", "location": "..." }`
* **Response (200):** Updated public user object.

#### Upload Profile Avatar
* `POST /api/users/me/avatar`
* **Auth:** Required
* **Content-Type:** `multipart/form-data` (Field: `image`, max 2MB, `png|jpeg|webp`).
* **Processing:** Transformed to 400x400 auto-cropped JPEG and uploaded to Cloudinary (`folder: 'devconnect'`).
* **Response (200):** Updated user object with new `avatarUrl`.

#### Add Skill
* `POST /api/users/me/skills`
* **Auth:** Required
* **Request Body:** `{ "name": "TypeScript" }`
* **Response (201):** Created or upserted skill object.

#### Delete Skill
* `DELETE /api/users/me/skills/:id`
* **Auth:** Required
* **Response (200):** `{ success: true, data: null, message: "Removed" }`

#### Add Project
* `POST /api/users/me/projects`
* **Auth:** Required
* **Request Body:**
  ```json
  {
    "title": "DevConnect",
    "description": "Networking platform",
    "techStack": ["React", "TypeScript", "Node.js"],
    "liveUrl": "https://...",
    "repoUrl": "https://..."
  }
  ```
* **Response (201):** Created project record.

#### Update / Delete Project
* `PUT /api/users/me/projects/:id`
* `DELETE /api/users/me/projects/:id`

---

### 4. Technical Blog System (`/api/posts`)

#### List Posts (Paginated)
* `GET /api/posts?page=1&author=username`
* **Auth:** Required
* **Response (200):** List of post summaries with author metadata ordered by newest.

#### Get Single Post
* `GET /api/posts/:id`
* **Auth:** Required
* **Side-effect:** Atomically increments `views` count by 1.
* **Response (200):** Complete post object including markdown `content` and author profile.

#### Create / Edit / Delete Post
* `POST /api/posts` -> Creates markdown post (201).
* `PUT /api/posts/:id` -> Updates post content (Author only).
* `DELETE /api/posts/:id` -> Deletes post (Author only).

---

### 5. Social Graph & Connections (`/api`)

#### Get Connections & Requests
* `GET /api/connections`
* **Auth:** Required
* **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "connections": [{ "id": "cuid...", "user": { ... } }],
      "incoming": [{ "id": "cuid...", "requester": { ... } }],
      "outgoing": [{ "id": "cuid...", "receiver": { ... } }]
    },
    "message": "OK"
  }
  ```

#### Send Connection Request
* `POST /api/connections/:userId`
* **Auth:** Required
* **Validation:** Cannot connect to self; cannot duplicate existing request.
* **Side-effect:** Creates DB record and triggers real-time Socket.io notification to receiver.
* **Response (201):** Connection record.

#### Accept / Reject Request
* `PATCH /api/connections/:id`
* **Auth:** Required
* **Request Body:** `{ "action": "accept" | "reject" }`
* **Side-effect on accept:** Emits `CONNECTION_ACCEPTED` notification to requester.

#### Remove Connection
* `DELETE /api/connections/:id`

---

### 6. Skill Endorsements (`/api/endorse`)

#### Endorse Skill
* `POST /api/endorse/:skillId`
* **Auth:** Required
* **Validation Rules:**
  1. Cannot endorse own skills.
  2. Users must have an `ACCEPTED` connection.
  3. Skill cannot be endorsed twice by the same user.
* **Side-effect:** Creates endorsement and emits real-time Socket.io notification.
* **Response (201):** `{ success: true, data: null, message: "Endorsed" }`

#### Revoke Endorsement
* `DELETE /api/endorse/:skillId`
* **Auth:** Required
* **Response (200):** `{ success: true, data: null, message: "Removed" }`

---

### 7. Notifications & Dashboard

#### Notifications
* `GET /api/notifications` -> Last 30 notifications for user.
* `POST /api/notifications/read` -> Marks all unread notifications as read.

#### Dashboard Summary
* `GET /api/dashboard`
* **Auth:** Required
* **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "feed": [ ...latest posts from connected users... ],
      "trending": [ ...top 5 most viewed posts... ],
      "suggestions": [ ...developers with overlapping skills... ],
      "topSkills": [ ...user's top 3 skills by endorsements... ],
      "stats": {
        "connections": 14,
        "posts": 5,
        "endorsements": 28
      }
    },
    "message": "OK"
  }
  ```

---

## WebSocket & Real-Time Events (Socket.io)

### Connection Handshake
* Handshake checks the `token` cookie via `jwt.verify()`.
* Successfully authenticated clients automatically join room `user:<userId>`.

### Socket Events
| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `connection` | Client -> Server | Cookies | Establishes WebSocket transport |
| `notification` | Server -> Client | `{ id, userId, type, message, read, createdAt }` | Pushed on connection requests, acceptances, and endorsements |
