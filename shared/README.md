# DevConnect Shared (`@devconnect/shared`)

This package contains shared TypeScript interfaces and Data Transfer Object (DTO) contracts consumed by both the **client** and **server** workspaces within the DevConnect monorepo.

---

## 🎯 Purpose & Benefits

1. **Zero API Drift:** When backend endpoints evolve, TypeScript compiler errors immediately flag out-of-sync frontend callers at build time.
2. **Standardized Envelopes:** Enforces consistent `{ success, data, message }` structure across all network interactions.
3. **DRY Contracts:** Eliminates duplicate model definitions between client components and backend controllers.

---

## 📋 Exported Types & Interfaces

```typescript
// Standard API Envelope
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

// User Profile Entity
export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
}

// Skill Entity with Optional Aggregated Endorsement Count
export interface Skill {
  id: string;
  name: string;
  _count?: {
    endorsements: number;
  };
}

// Portfolio Project Entity
export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  liveUrl?: string | null;
  repoUrl?: string | null;
}

// Technical Blog Post Entity
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  views: number;
  createdAt: string;
  author?: User;
}

// Connection Status Enum
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

// Real-Time Notification Entity
export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}
```

---

## 💻 Usage

In any client or server file:
```typescript
import type { ApiResponse, User, BlogPost, Skill } from '@devconnect/shared';
```
