# DevConnect — User Flow Diagrams

This document illustrates the end-to-end user journeys and system interactions for all primary capabilities in the DevConnect platform.

---

## 1. User Registration & Authentication Flow

### Local Email/Password and GitHub OAuth 2.0

```mermaid
flowchart TD
    Start([User visits DevConnect]) --> ChooseAuth{Choose Auth Method}

    %% Email Path
    ChooseAuth -->|Email / Password| Form[Fill Registration Form\nName, Username, Email, Password]
    Form --> SubmitForm[POST /api/auth/register]
    SubmitForm --> ValidateZod{Zod Validation\nEmail, Pass >= 8 chars,\nUsername regex}
    ValidateZod -->|Invalid| ShowErr[Display Inline Form Error]
    ShowErr --> Form
    ValidateZod -->|Valid| CheckDB{Check Email / Username\nUniqueness}
    CheckDB -->|Taken| ShowConflict[Display 409 Conflict Error]
    ShowConflict --> Form
    CheckDB -->|Unique| HashPass[Bcrypt Hash Password]
    HashPass --> CreateUser[Prisma: Create User]
    CreateUser --> IssueJWT[Generate JWT Token]
    IssueJWT --> SetCookie[Set httpOnly Cookie 'token']

    %% GitHub OAuth Path
    ChooseAuth -->|GitHub OAuth| ClickGH[Click 'Continue with GitHub']
    ClickGH --> RedirectGH[GET /api/auth/github\nRedirect to github.com/login/oauth]
    RedirectGH --> Authorize[User Grants Permission]
    Authorize --> Callback[GET /api/auth/github/callback?code=...]
    Callback --> ExchangeToken[Exchange code for Access Token]
    ExchangeToken --> FetchProfile[Fetch GitHub Profile & Primary Email]
    FetchProfile --> UpsertGHUser[Prisma: Find or Create User with githubId]
    UpsertGHUser --> IssueJWT

    SetCookie --> RedirectApp[Redirect to /dashboard]
    RedirectApp --> ShellInit[Shell loads: Fetch /api/auth/me\nConnect Socket.io client]
    ShellInit --> Done([Authenticated User Dashboard])
```

---

## 2. Profile Management & Project Showcase Flow

```mermaid
flowchart TD
    User([User navigates to /u/username]) --> IsOwner{Is Profile Owner?}
    
    %% View Mode
    IsOwner -->|No: Other Developer| ViewProfile[Display Profile Hero, Bio, Location]
    ViewProfile --> ShowSkills[Render Skills with Endorsement Counts]
    ShowSkills --> ShowProjects[Render Projects Showcase with Live & Repo Links]
    ShowSkills --> CheckConn{Connection Status?}
    CheckConn -->|Not Connected| ShowConnectBtn[Show 'Connect' button]
    CheckConn -->|Pending| ShowPendingBadge[Show 'Pending' status]
    CheckConn -->|Connected| ShowEndorseBtn[Enable '+1' Endorsement Buttons]

    %% Edit Mode
    IsOwner -->|Yes: Current User| ViewOwn[Display Profile with 'Edit Profile' Button]
    ViewOwn --> EditClick[User clicks 'Edit Profile']
    EditClick --> InlineEdit[Inline Fields: Name, Bio, Location]
    InlineEdit --> AvatarUpload[Select Avatar Image]
    AvatarUpload --> CanvasCompress[Client Canvas Compress\nMax 800px, JPEG 0.85, < 2MB]
    CanvasCompress --> UploadCloudinary[POST /api/users/me/avatar\nMulter -> Cloudinary 400x400]
    InlineEdit --> SaveProfile[PUT /api/users/me]
    SaveProfile --> InvalidateUserCache[React Query: Invalidate 'user' & 'me']

    %% Add Skill & Project
    ViewOwn --> AddSkill[Type skill & submit -> POST /api/users/me/skills]
    ViewOwn --> AddProj[Fill Project Modal: Title, Desc, Tech Stack, URLs]
    AddProj --> SubmitProj[POST /api/users/me/projects]
    SubmitProj --> InvalidateUserCache
```

---

## 3. Connection Request Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Developer Alice
    participant ClientA as Alice's Browser (React)
    participant Server as Express API
    participant DB as Neon PostgreSQL
    participant Socket as Socket.io Server
    participant ClientB as Bob's Browser (React)
    actor Bob as Developer Bob

    Alice->>ClientA: Clicks "Connect" on Bob's profile
    ClientA->>Server: POST /api/connections/{bobId}
    Server->>DB: Check existing connection status
    DB-->>Server: No existing connection
    Server->>DB: INSERT into Connection (requester: Alice, receiver: Bob, status: PENDING)
    Server->>DB: INSERT into Notification (userId: Bob, type: CONNECTION_REQUEST)
    Server->>Socket: io.to("user:" + bobId).emit("notification", notificationData)
    Socket-->>ClientB: WebSocket event 'notification'
    ClientB->>Bob: Displays instant toast banner & increments bell badge
    Server-->>ClientA: 201 Created { success: true, message: "Request sent" }
    ClientA->>Alice: Updates button to "Pending"

    Bob->>ClientB: Navigates to /network
    ClientB->>Server: GET /api/connections
    Server-->>ClientB: { incoming: [ { requester: Alice, id: connId } ] }
    Bob->>ClientB: Clicks "Accept"
    ClientB->>Server: PATCH /api/connections/{connId} { action: "accept" }
    Server->>DB: UPDATE Connection SET status = 'ACCEPTED'
    Server->>DB: INSERT into Notification (userId: Alice, type: CONNECTION_ACCEPTED)
    Server->>Socket: io.to("user:" + aliceId).emit("notification")
    Socket-->>ClientA: WebSocket event 'notification'
    ClientA->>Alice: Displays toast "Bob accepted your connection"
    Server-->>ClientB: 200 OK
    ClientB->>Bob: Updates list into Connected Developers
```

---

## 4. Skill Endorsement & Real-Time Notification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Bob as Developer Bob (Connected)
    participant ClientB as Bob's Browser (React)
    participant Server as Express API
    participant DB as Neon PostgreSQL
    participant Socket as Socket.io Server
    participant ClientA as Alice's Browser (React)
    actor Alice as Developer Alice

    Bob->>ClientB: Visits Alice's Profile (/u/alice_dev)
    ClientB->>Server: GET /api/users/alice_dev
    Server->>DB: Query Alice's skills and connection between Bob & Alice
    DB-->>Server: Status = ACCEPTED
    Server-->>ClientB: Returns skills with endorsement status and counts
    ClientB->>Bob: Renders active '+1' button next to "TypeScript"

    Bob->>ClientB: Clicks '+1' on "TypeScript"
    ClientB->>Server: POST /api/endorse/{skillId}
    Server->>DB: Verify connection (status === 'ACCEPTED')
    Server->>DB: Check unique constraint (skillId, bobId)
    Server->>DB: INSERT into Endorsement (skillId, endorserId: Bob)
    Server->>DB: INSERT into Notification (userId: Alice, type: ENDORSEMENT)
    Server->>Socket: io.to("user:" + aliceId).emit("notification")
    Socket-->>ClientA: WebSocket push event
    ClientA->>Alice: Real-time toast "Bob endorsed your TypeScript skill"
    Server-->>ClientB: 201 Created
    ClientB->>Bob: Button updates to "Endorsed ✓" with count + 1
```

---

## 5. Technical Blog System Lifecycle

```mermaid
flowchart LR
    Write[Author writes Markdown in Editor] --> LivePreview[Rehype-Highlight parses & renders side-by-side preview]
    LivePreview --> Publish[Click 'Publish' -> POST /api/posts]
    Publish --> StorePost[Prisma stores Markdown string in PostgreSQL]
    StorePost --> InvalidateBlog[React Query updates feed]
    InvalidateBlog --> ReaderVisits[Other developer navigates to /blog/:id]
    ReaderVisits --> IncViews[Prisma atomically increments 'views: { increment: 1 }']
    IncViews --> RenderGfm[ReactMarkdown renders formatted code blocks & headings]
```
