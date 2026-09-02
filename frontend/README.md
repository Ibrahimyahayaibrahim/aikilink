# aikilink — Web Client

React + Vite web client for *Design and Implementation of a Web and Mobile-Based
Platform for Connecting Local Service Providers with Homeowners in Nigeria*. Talks to
the `backend` project's REST API.

## Design

- **Colors**: deep teal (`#0E5C56`, trust/professional) + amber (`#E2962C`, evoking
  hazard tape and danfo-bus yellow — grounded in the trades/local-transit context) on a
  warm paper background.
- **Type**: Plus Jakarta Sans (headings) + Inter (body/UI).
- **Signature**: job listings are styled as a "docket" — a perforated ticket edge, since
  a Job Posting really is a work ticket. Urgent jobs get a hazard-stripe treatment on
  that edge instead of the plain teal stripe.

## Getting started

### 1. Make sure the backend is running first

This app is only a client — it does nothing without the API. Follow `backend/README.md`
to get it running (seeded, with categories/areas populated) at `http://localhost:5000`.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the API URL

```bash
cp .env.example .env
```

The default (`http://localhost:5000/api`) matches the backend's default port — only
change this if you changed `PORT` in the backend's `.env`.

### 4. Run it

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Pages / flow

| Route | Who | What |
|---|---|---|
| `/` | anyone | Landing page |
| `/register`, `/login` | anyone | Auth |
| `/homeowner` | homeowner | My jobs list |
| `/homeowner/post` | homeowner | Post a job |
| `/homeowner/jobs/:id` | homeowner | Job detail — see interested providers, claim, reopen, complete, rate |
| `/provider` | provider | Job feed — "Matched for you" (push) and "Browse all" (pull, with filters) |
| `/provider/profile` | provider | Set categories, coverage areas, bio, ID reference |
| `/provider/jobs/:id` | provider | Job detail — express interest, reveals homeowner's phone |

## A note on one design change made while building this

The original API spec (Chapter 3, Table 3.14) had no way for a homeowner to see *who*
expressed interest in their job — only a phone call happens, with no in-app record. But
that leaves no way to actually complete `PATCH /api/jobs/:id/claim`, which requires a
specific `providerId`: the homeowner would know a caller's name and phone number, not
their internal system id.

**Fix**: added `GET /api/jobs/:id/interested` (homeowner-only, must own the job) to the
backend, returning each interested provider's name, phone, id, and average rating, so
the homeowner can match "who called me" to a name in the list and claim the right
person. This is documented in the backend's controller and README — worth mentioning in
Chapter Four as a gap the implementation stage surfaced in the original design.

## Known limitations (by design, matches Chapter 3 scope)

- No SMS/push notifications — everything is in-app only, meaning a user has to actually
  open the app to see updates (Section 3.6).
- No payment/escrow integration.
- ID/certificate "upload" here just takes a text reference (a real file-upload pipeline
  is out of scope for this MVP — see backend README).
- Mobile client is a later phase; this is web only.
