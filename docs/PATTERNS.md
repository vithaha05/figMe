# Software & Cloud Patterns

## Software Patterns Applied

### Observer Pattern — Auth (lib/supabase.ts, context/AuthContext.tsx)
Supabase `onAuthStateChange` is the event source. All UI components subscribe
via `useAuth()` hook. When auth state changes, all subscribers are notified
automatically without polling.

**Benefits:**
- Decouples auth logic from UI
- Components stay in sync automatically
- Single source of truth

### Repository Pattern — Data Access (lib/documents.ts)
Single abstraction layer over Supabase PostgreSQL. No component ever calls
the Supabase client directly. All DB queries go through repository functions.

**Benefits:**
- Easy to swap database backends
- Centralized query logic
- Testable data layer
- RLS policies enforced at DB layer, not app layer

### Strategy Pattern — RBAC (lib/rbac.ts)
Each role (owner/editor/viewer) encapsulates its own permission rules.
Components receive a `RoleStrategy` and ask it "can I do X?" rather than
checking role names directly.

**Benefits:**
- Add new roles without changing canvas code
- Clear permission semantics
- Zero-trust verification at runtime
- Easy to test permissions

### Facade Pattern — Cloudinary (lib/cloudinary.ts)
Hides multi-step Cloudinary signed upload flow behind simple `uploadToCloudinary(file)`
function. Caller doesn't know about signatures, API keys, or CDN endpoints.

**Benefits:**
- Simple API for complex operation
- Encapsulates Cloudinary implementation details
- Easy to swap CDN providers
- Keeps upload logic in one place

## Cloud Patterns Applied

### Backend-as-a-Service — Supabase Auth
Authentication fully delegated to managed cloud service. No custom auth
server to build, maintain, or scale.

**Benefits:**
- Zero ops burden
- Enterprise OAuth2 security
- Automatic scaling
- Built-in session management

### Managed Database with RLS — Supabase PostgreSQL
Row-Level Security policies enforced at the database layer. Users cannot
access rows they don't have permission for, period.

**Benefits:**
- Security at DB layer (defense in depth)
- No app-level permission middleware needed
- Automatic enforcement
- ACID transactions

### Zero-Trust Access Control — RBAC Middleware
Every operation verifies the user's actual role at runtime by querying
the `document_collaborators` table. Never trust the session alone.

**Benefits:**
- Principle of least privilege
- Detects permission changes instantly
- Prevents privilege escalation
- Audit trail in DB

### CDN Offloading — Cloudinary
Binary image assets served from Cloudinary's global CDN, not from our
app server. Auto-resizing, auto-format, and edge caching reduce bandwidth.

**Benefits:**
- Server never handles image bandwidth
- Global edge delivery
- Auto-optimization (WEBP, lossy JPEG, etc.)
- Reduced latency for users worldwide

### CI/CD Pipeline as Code — GitHub Actions + Vercel
Deployment process defined in version-controlled YAML. Every push to
`main` triggers automated test, build, and deploy.

**Benefits:**
- Reproducible deployments
- No manual steps (error-prone)
- Immutable preview deployments per PR
- Audit trail of all deployments
