# Local Services Backend

REST API backend for *Design and Implementation of a Web and Mobile-Based Platform for
Connecting Local Service Providers with Homeowners in Nigeria*.

Implements the design described in Chapter Three: an 8-entity MongoDB data model, a
hybrid push/pull matching algorithm, the Open → Claimed → Completed job lifecycle with
manual reopen, and the REST API specified in Table 3.14.

## Tech stack

- Node.js + Express (REST API), written as native **ES Modules** (`"type": "module"`)
- MongoDB + Mongoose (data layer)
- JWT for stateless authentication
- Jest + Supertest for testing

## Security measures implemented

This is a student project, not a production fintech system — but the following are real,
tested measures rather than a checklist for its own sake:

| Concern | Measure |
|---|---|
| Transport/response hardening | `helmet` sets a strict CSP (`default-src 'none'`, appropriate for a JSON-only API), disables `X-Powered-By`, and applies other standard secure headers |
| Brute force / credential stuffing | `express-rate-limit` on all routes (300 req/15min) and a tighter limit on `/api/auth/*` (20 req/15min); **plus** account-level lockout after 5 failed logins (15 min) |
| NoSQL injection | `express-mongo-sanitize` strips `$`/`.` keys from `body`/`query`/`params`; Mongoose's `sanitizeFilter` is also enabled as a second layer |
| HTTP Parameter Pollution | `hpp` |
| Mass assignment | Controllers whitelist exactly which fields a client can set (e.g. `PUT /api/users/me` cannot set `role` or `accountStatus`) rather than spreading `req.body` |
| JWT forgery / alg confusion | Tokens are verified with `algorithms: ["HS256"]` pinned explicitly, plus an `issuer` claim check — a token signed with `alg: "none"` or a different algorithm is rejected |
| Password strength | Enforced server-side (min 8 chars + a number) via the `validator` package |
| Input validation | Phone numbers, emails, ObjectIds, and rating scores are all validated before touching the database; malformed `:id` route params are rejected with 400 before reaching a query |
| Payload size | `express.json({ limit: "10kb" })` caps request body size |
| User enumeration | Login and registration return deliberately generic error messages so a caller can't tell *why* a request failed (unknown phone vs wrong password vs locked account) |
| Sensitive data exposure | `passwordHash` (and login-attempt bookkeeping) is `select: false` in the schema **and** stripped again in `toJSON` as a second layer, so it can never leak into a response even by accident |
| Config hygiene | The server refuses to start if `JWT_SECRET` is missing or under 24 characters, rather than booting into an insecure state |
| CORS | Origins are explicitly whitelisted via `CLIENT_ORIGINS`; requests from any other origin are rejected outright (fails closed, not open) |
| Error handling | Stack traces / internal error details are never sent to the client when `NODE_ENV=production` |

None of this replaces a real security review before any production deployment — but it
is a genuine, defensible baseline for a final-year project defense.

## Getting started

### 1. Prerequisites

- Node.js 18+ (uses native ES Modules) and npm
- A MongoDB instance — either:
  - **Local**: install MongoDB Community Server and run `mongod`, or
  - **Hosted**: create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) and copy its connection string

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Then edit `.env` and set at minimum:
- `MONGODB_URI` — your local or Atlas connection string
- `JWT_SECRET` — a long random string (24+ characters; the server won't start otherwise). Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `CLIENT_ORIGINS` — the origin(s) your React app will run on (e.g. `http://localhost:5173`)

### 4. Seed the fixed lookup lists

Categories and Areas are a fixed, predefined list (Section 1.5) rather than user-entered
free text. Populate them once:

```bash
npm run seed
```

Edit `seed/seed.js` to add/adjust categories and areas for your actual pilot location
before seeding.

### 5. Run the server

```bash
npm run dev     # with nodemon (auto-restart on changes)
# or
npm start       # plain node
```

The API will be available at `http://localhost:5000/api`. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

### 6. Run the tests

```bash
npm test
```

This runs 38 tests without needing a live database connection — it verifies input
validation, authentication (including JWT forgery/alg-confusion attempts), role
enforcement, injection resistance, and the matching algorithm in isolation. Once you have
a MongoDB connection configured, you can extend `tests/` with full end-to-end tests that
exercise the database (e.g. using `mongodb-memory-server` if your network allows
downloading its binary, or a disposable test database).

## Project structure

```
backend/
  config/db.js               MongoDB connection
  models/                    Mongoose schemas (Tables 3.5–3.12)
  controllers/                Route handler logic
  routes/                    Express routers (Table 3.14)
  middleware/
    auth.js                   JWT verification + role checks
    security.js                helmet, rate limiting, mongo-sanitize, hpp
    errorHandler.js            Centralised, production-safe error responses
    asyncHandler.js            Wraps async route handlers
  utils/
    matching.js                 Pure matching-rule function (Section 3.13), unit-tested
    validators.js               Input validation (phone, email, password, ObjectId, score)
    schemaOptions.js            Shared toJSON hardening (strips __v, passwordHash, etc.)
  seed/seed.js                Populates fixed Category/Area lists
  tests/                      Jest + Supertest test suite (38 tests)
  server.js                   App entry point
```

## API overview

See Chapter Three, Table 3.14 for the full endpoint specification. Summary:

| Resource | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Users | `GET /api/users/me`, `PUT /api/users/me` |
| Providers | `PUT /api/providers/me`, `POST /api/providers/me/id-upload`, `GET /api/providers/:id`, `GET /api/providers/:id/ratings` |
| Jobs | `POST /api/jobs`, `GET /api/jobs` (pull), `GET /api/jobs/matches` (push), `GET /api/jobs/mine`, `GET /api/jobs/:id`, `POST /api/jobs/:id/interest`, `PATCH /api/jobs/:id/claim`, `PATCH /api/jobs/:id/reopen`, `PATCH /api/jobs/:id/complete`, `POST /api/jobs/:id/rating` |
| Lookups | `GET /api/categories`, `GET /api/areas` |

## Design notes for the project report (Chapter Four)

- **Push vs pull**: there is no websocket/SMS/push infrastructure in this MVP (Section
  3.6). "Push" is realised as `GET /api/jobs/matches`, which auto-filters Open jobs by
  the logged-in provider's own categories/coverage areas. "Pull" is `GET /api/jobs`,
  the same underlying query driven by filters the provider supplies. Both read the same
  `JobPosting` collection — there's no separate notification store.
- **FCFS contact**: `POST /api/jobs/:id/interest` logs interest and returns the
  homeowner's phone number in the response — this is the moment the wireframe's
  "Express Interest (reveals phone no.)" button corresponds to. The actual phone call
  happens outside the system entirely, matching Figure 3.10.
- **Notifying other providers a job is taken**: there's no push channel to notify them
  actively; instead, the job simply disappears from their `GET /api/jobs/matches` and
  `GET /api/jobs` results once claimed, which is consistent with the in-app-only
  notification design (Section 3.6, Table 3.2).
- **Claim precondition enforcement**: `PATCH /api/jobs/:id/claim` now checks that the
  selected provider actually has a `JobInterestLog` entry for that job, enforcing the
  precondition stated in the use case table (Table 3.4) at the code level, not just on
  paper.
