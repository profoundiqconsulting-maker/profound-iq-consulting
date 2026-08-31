# Profound IQ Consulting - Self-Hosted Runtime Implementation

## Summary

Successfully rebuilt the Manus WebDev platform runtime layer as a self-hosted system. The app is now ready to run standalone on DigitalOcean without any platform dependencies.

---

## Implementation Complete ✅

### Task 1: Auth & Context Layer - DONE

**Auth Approach: Email/Password with JWT Sessions**
- Email/password chosen over OAuth because:
  1. Self-hosted is simpler without third-party OAuth infrastructure
  2. App only needs auth for admin + handful of returning users (per spec)
  3. Easier to manage credentials in-house
  4. Can add OAuth later if needed
  
**What Changed:**
- `server/_core/env.ts`: Replaced Manus platform vars with self-hosted config
- `server/_core/sdk.ts`: Replaced OAuthService with SessionManager (JWT-only)
  - Sessions now use JWT tokens signed with SESSION_SECRET
  - No external OAuth server calls
  - Tokens stored as httpOnly cookies: `app_session_id=<JWT>`
- `server/_core/context.ts`: Simplified to read JWT + load user from DB
- `server/_core/oauth.ts`: Stubbed out (auth is tRPC-based now)
- `server/_core/cookies.ts`: No changes needed, already correct

**Auth Flows (via tRPC):**
- `auth.register`: Email/password signup with password validation
- `auth.login`: Authenticate with email/username + password, rate-limited
- `auth.requestPasswordReset`: Send password reset email
- `auth.resetPassword`: Reset with token
- `auth.logout`: Revoke session token

**Environment Variables - NEW:**
- `SESSION_SECRET` - 32+ byte random string for JWT signing (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ADMIN_EMAIL` - Email of initial admin user (set on first signup)

**Admin Designation:**
- Replaced `ENV.ownerOpenId` with `ADMIN_EMAIL` env var
- Any user signing up with email matching `ADMIN_EMAIL` gets admin role
- No need for seed scripts or manual DB manipulation

**Session Context (`ctx.user`) Shape:**
- Kept exactly as existing code expects: `{ openId, email, name, role, ... }`
- No changes to router.ts or db.ts needed
- All existing database functions work unchanged

---

### Task 2: Storage Layer - DONE

**Approach: DigitalOcean Spaces (S3-Compatible)**
- Replaced Manus Forge with direct DO Spaces uploads
- @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner already in dependencies

**Changes:**
- `server/storage.ts`: Complete rewrite
  - `storagePut()`: Uploads directly to DO Spaces
  - `storageGet()`: Returns public URL for direct access
  - `storageGetSignedUrl()`: Generates temporary presigned URLs (1 hour default)
  - Function signatures unchanged - no router.ts changes needed
- `server/_core/storageProxy.ts`: Stubbed out
  - No `/manus-storage/*` redirect layer needed
  - Files accessed directly via DO Spaces public URLs

**Environment Variables - NEW:**
- `DO_SPACES_ENDPOINT` - e.g., `https://nyc3.digitaloceanspaces.com`
- `DO_SPACES_REGION` - e.g., `nyc3`, `sfo3`, `ams3`
- `DO_SPACES_BUCKET` - Your bucket name
- `DO_SPACES_ACCESS_KEY` - From DO Applications & API
- `DO_SPACES_SECRET_KEY` - From DO Applications & API
- `DO_SPACES_BASE_URL` - Public URL for files (optional, auto-constructed if omitted)

**Avatar URLs:**
- Now point directly to DO Spaces: `https://bucket.region.digitaloceanspaces.com/avatars/file_hash.ext`
- No server proxy needed, reduces load

---

### Task 3: Local Development Setup - READY

**All Required Environment Variables:**

```env
# Database (required)
DATABASE_URL=mysql://root:password@localhost:3306/profound_iq

# Auth (required)
SESSION_SECRET=<random-32-byte-hex>
ADMIN_EMAIL=admin@profoundiq.com

# Server (optional)
PORT=3000
NODE_ENV=development

# Storage (required for avatar uploads)
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_REGION=nyc3
DO_SPACES_BUCKET=my-bucket
DO_SPACES_ACCESS_KEY=xxxxx
DO_SPACES_SECRET_KEY=xxxxx
DO_SPACES_BASE_URL=https://my-bucket.nyc3.digitaloceanspaces.com

# Email & Payment (required)
PAYSTACK_SECRET_KEY=sk_test_xxxxx
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@profoundiq.com
```

See `.env.example` for full documentation.

**Setup Checklist:**
```bash
# 1. Install dependencies
pnpm install

# 2. Create .env from template
cp .env.example .env
# Edit .env with your actual values

# 3. Set up local MySQL
# Create database: profound_iq

# 4. Run migrations
pnpm db:push

# 5. Start dev server
pnpm dev

# 6. Optional: Run tests
pnpm test

# 7. Build for production
pnpm build
npm start
```

---

## What Wasn't Changed (Intentionally)

- `server/routers.ts` - Auth already uses `createLocalUser`, `sdk.createSessionToken`, etc.
- `server/db.ts` - All functions already support local auth
- Client-side code - No changes needed
- Database schema - Supports email/password auth natively (has `passwordHash` field)
- UI/UX - Comes in later phase

---

## Manual Cleanup

**Dead Code to Remove:**
- `server/index.ts` - Duplicates Vite setup from `server/_core/vite.ts`
  - Not imported anywhere
  - Dev script uses `server/_core/index.ts`
  - Can be deleted safely

---

## Database State

All required fields already in place:
- `users.passwordHash` - scrypt-hashed passwords
- `users.passwordResetTokenHash` - for reset flow
- `users.role` - "user", "staff", "admin"
- `users.email` - for login + admin check
- `userSessions` table - tracks active sessions for audit trail
- `loginEvents` table - tracks login attempts for security

No migrations needed.

---

## New Environment Variables Reference

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `DATABASE_URL` | MySQL connection | Yes | `mysql://root:pass@localhost/db` |
| `SESSION_SECRET` | JWT signing key | Yes | 64-char hex string |
| `ADMIN_EMAIL` | Initial admin email | Yes | `admin@example.com` |
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment | No | `development` or `production` |
| `DO_SPACES_ENDPOINT` | DO Spaces endpoint | Yes | `https://nyc3.digitaloceanspaces.com` |
| `DO_SPACES_REGION` | DO Spaces region | Yes | `nyc3` |
| `DO_SPACES_BUCKET` | DO Spaces bucket | Yes | `my-bucket` |
| `DO_SPACES_ACCESS_KEY` | DO Spaces API key | Yes | From DO console |
| `DO_SPACES_SECRET_KEY` | DO Spaces secret | Yes | From DO console |
| `DO_SPACES_BASE_URL` | Public URL for files | No | Auto-constructed |
| `PAYSTACK_SECRET_KEY` | Payment processor key | Yes | `sk_test_...` or `sk_live_...` |
| `RESEND_API_KEY` | Email service API key | Yes | `re_...` |
| `EMAIL_FROM` | Sender email address | Yes | `noreply@example.com` |

---

## Auth Security Features (Inherited from Existing Code)

- ✅ Passwords hashed with scrypt (async, timing-safe)
- ✅ Rate limiting on login attempts (per identifier + network)
- ✅ Failed login tracking and alerts
- ✅ Session revocation support
- ✅ httpOnly secure cookies (prevent XSS token theft)
- ✅ Password reset tokens (one-time use, expiring)
- ✅ Login event audit trail
- ✅ Configurable session duration (1 year default, 30 days for device trust)

---

## Next: Manual Testing Checklist

Before deploying to DigitalOcean:

**Authentication:**
- [ ] Signup with valid email/password
- [ ] Login with correct credentials
- [ ] Login rejected with wrong password
- [ ] Rate limiting blocks after N failed attempts
- [ ] Logout revokes session
- [ ] Protected endpoints return 401 when unauthorized
- [ ] Password reset flow (email sent, link expires, new password works)

**Storage:**
- [ ] Avatar upload succeeds
- [ ] Avatar URL is public DO Spaces URL
- [ ] Avatar accessible from browser
- [ ] Avatar persists after logout/login

**Workflows:**
- [ ] Assessment flow completes
- [ ] Paystack payment (test mode) processes
- [ ] Report generated and viewable
- [ ] Dashboard shows user history
- [ ] Admin can access admin overview
- [ ] Admin can manage users/settings

**Quality:**
```bash
pnpm check     # TypeScript
pnpm format    # Prettier
pnpm test      # Unit tests
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│ Client (React 19 + Vite)                                │
└────────────────┬────────────────────────────────────────┘
                 │ tRPC + HTTP
┌────────────────▼────────────────────────────────────────┐
│ Express Server (Node.js)                                │
│  ├─ tRPC API (/api/trpc)                               │
│  │  ├─ auth.register/login/logout                       │
│  │  ├─ assessment, psychometric, courses, etc.          │
│  │  └─ admin procedures                                 │
│  ├─ Health check (/system/health)                       │
│  └─ Static files (index.html for SPA routing)           │
└─┬──────────────────────────────────────────────────────┬┘
  │                                                       │
  ├─ Drizzle ORM ──────────────────────────────────────┬─┘
  │                                                     │
┌─▼──────────────────┐                    ┌────────────▼──────┐
│ MySQL Database     │                    │ DigitalOcean      │
│ (users, sessions,  │                    │ Spaces (S3)       │
│  enrollments, etc) │                    │ (avatars, files)  │
└────────────────────┘                    └───────────────────┘

Authentication Flow:
  1. POST /api/trpc/auth.login {email, password}
  2. Server verifies password, creates JWT
  3. Response sets Cookie: app_session_id=<JWT>
  4. Subsequent requests sent with cookie
  5. Context reads JWT, loads user from DB
  6. Protected procedures check ctx.user

Storage Flow:
  1. Client uploads avatar
  2. storagePut() uploads to DO Spaces
  3. Returns public URL: https://bucket.region.spaces.com/...
  4. Avatar URL stored in users.avatarUrl
  5. Client loads avatar directly from Spaces
```

---

## Files Modified

| File | Changes |
|------|---------|
| `server/_core/env.ts` | Complete rewrite - self-hosted config |
| `server/_core/sdk.ts` | Complete rewrite - JWT-only sessions |
| `server/_core/context.ts` | Simplified - no SDK auth wrapping |
| `server/_core/oauth.ts` | Stubbed - auth is tRPC-based |
| `server/_core/storageProxy.ts` | Stubbed - direct DO Spaces access |
| `server/storage.ts` | Complete rewrite - AWS SDK v3 |
| `.env.example` | Created - full documentation |

---

## Deferred (Outside Scope - Next Phases)

- Social OAuth (Google, LinkedIn) - if needed later
- UI/UX refinement - next phase after foundation works
- Route/workflow alignment - next phase
- Payment provider integration testing - next phase
- Email service setup (Resend) - needs API key
- DO Spaces setup - needs account & bucket

---

## Support & Troubleshooting

**SESSION_SECRET not set?**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to .env
```

**Database connection fails?**
- Verify MySQL running: `mysql -u root -p`
- Check DATABASE_URL format in .env
- Run migrations: `pnpm db:push`

**Storage uploads fail?**
- Verify DO Spaces credentials in .env
- Check bucket exists and is accessible
- Verify S3 endpoint URL is correct

**Auth not working?**
- Check SESSION_SECRET is set and not empty
- Verify ADMIN_EMAIL matches first signup email
- Check cookies enabled in browser (dev tools)
- Check browser console for errors

---

**Status: ✅ READY FOR LOCAL TESTING**

The self-hosted foundation is complete. All platform dependencies removed. Auth, database, and storage are configured for standalone operation.

Next step: Local testing via checklist, then deployment to DigitalOcean droplet.
