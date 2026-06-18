# Dyad Practice Solutions — Application Architecture Report

**Project:** healthcare-app (newui)  
**Report Date:** June 12, 2026  
**Type:** Frontend SPA with REST backend dependency  
**Stack:** React 19 · TypeScript · Vite 8 · React Router 7 · Axios

---

## 1. Executive Summary

Dyad Practice Solutions is a healthcare-focused single-page application (SPA) that combines a marketing landing site, early-access intake, multi-step client onboarding, and admin operations tooling. The frontend is built with React and Vite and communicates with a separate Node/Express-style backend (default: `http://localhost:5000`, proxied as `/api` in development, deployed example: Railway).

The application serves three distinct user journeys in parallel:

1. **Public marketing & intake** — landing pages, contact, early access registration
2. **Authenticated admin operations** — early access review, outreach scheduling, active client management
3. **Client onboarding enrollment** — 6-step workflow with OTP login, document signing, calendar booking, and payment setup

State is managed primarily through React Context and localStorage/sessionStorage, with server persistence for onboarding steps via REST APIs.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │   Pages     │  │  Components  │  │  Services (API layer)           │ │
│  │  (Routes)   │──│  admin       │──│  api.ts, calendar, email, NPI │ │
│  │             │  │  onboarding  │  │  onboardingStorage, hydration   │ │
│  └─────────────┘  │  landing     │  └─────────────────────────────────┘ │
│                   └──────────────┘                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  State: AuthContext | localStorage | SecureSessionStorage (AES)     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS / REST (Axios)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Backend API (Node/Express assumed)                    │
│  Auth · Early Access · Onboarding · Calendar · NPI · Email relay        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            Google Calendar    NPI Registry    Email (SMTP/SendGrid)
            Calendly webhook   CMS data        OTP delivery
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | React 19.2 | Component-based UI |
| Language | TypeScript 5.9 | Type safety |
| Build | Vite 8 | Dev server, bundling, HMR |
| Routing | React Router DOM 7 | Client-side routing |
| HTTP | Axios 1.13 | API calls with interceptors |
| Forms | React Hook Form + Yup | Validation |
| Styling | Tailwind CSS 3.4 + custom CSS | Hybrid styling |
| Icons | Lucide React | Icon set |
| Notifications | react-hot-toast | Toast messages |
| Charts | Recharts | Admin reports |
| Crypto | crypto-js | Client-side token obfuscation |
| CAPTCHA | react-google-recaptcha | Bot protection |
| Scheduling | react-calendly + custom calendar | Meeting booking |

---

## 4. Project Structure

```
src/
├── App.tsx                 # Root router, security init, AuthProvider
├── main.tsx                # Entry point
├── pages/                  # Route-level screens
│   ├── DyadOnboarding.tsx  # 6-step enrollment (~3,300 lines)
│   ├── AdminEarlyAccess.tsx
│   ├── EarlyAccess.tsx
│   ├── Login.tsx, Register.tsx
│   └── ...
├── components/
│   ├── admin/              # Admin panels, modals, nav
│   ├── onboarding/         # Step 3–6 subcomponents
│   ├── landing/            # Marketing sections
│   ├── auth/               # LoginWithCodeForm
│   └── common/             # Header, Footer, ErrorBoundary
├── contexts/
│   └── AuthContext.tsx     # JWT auth state
├── services/               # API & domain logic (13 services)
├── hooks/                  # useOnboardingSessionGuard, etc.
├── utils/                  # security, sessionStorage, validation
├── styles/                 # Global CSS modules
└── types/                  # TypeScript interfaces
```

---

## 5. Routing & Access Control

| Route | Component | Protection |
|-------|-----------|------------|
| `/` | DyadLanding | Public |
| `/early-access` | EarlyAccess | Public |
| `/login`, `/register` | Auth pages | Public |
| `/client-onboarding-process` | DyadOnboarding | OnboardingProtectedRoute (OTP session) |
| `/dyad-onboarding-access` | DyadOnboarding | Public (no session required) |
| `/admin-early-access` | AdminEarlyAccess | Admin token in localStorage |
| `/admin` | Admin | ProtectedRoute (JWT, role=admin) |
| `/user/*` | ComingSoon | ProtectedRoute (JWT, role=user) |

### Three Parallel Auth Systems

1. **AuthContext (JWT)** — Main login/register/OTP flow. Tokens stored in encrypted sessionStorage. Used for `/admin` and `/user/*`.
2. **Admin Early Access** — Separate `POST /admin/login` flow. Plain localStorage tokens (`adminAccessToken`, `adminRefreshToken`).
3. **Onboarding Client** — OTP via email (`/onboarding/verify-login-otp`). Session in `dyad_onboarding_client_session` (24h TTL).

---

## 6. Feature Domains

### 6.1 Marketing & Landing
- Hero, about, services, contact forms
- reCAPTCHA on contact submissions
- Calendly embed for scheduling

### 6.2 Early Access
- Public intake with NPI validation and email OTP
- Admin review panel: submissions, beta cohort, invite emails
- Backend: `POST /api-early-access`, `/api-early-access/check-email`

### 6.3 Client Onboarding (6 Steps)

| Step | Name | Key Features |
|------|------|--------------|
| 1 | Overview | NPI lookup, practice type selection |
| 2 | Schedule Intro Call | Google Calendar picker, time slots, email confirmation |
| 3 | Sign Agreements | NDA, BAA, e-signature attestations |
| 4 | Due Diligence | Document uploads |
| 5 | Commercial Alignment | MSA, exhibits, fee schedule |
| 6 | Bank & Payment | W-9, Zoho Pay widget (UI mock) |

**Persistence:** Debounced localStorage (`dyad_onboarding_v1`) + `POST /onboarding/step/:n` to backend.

### 6.4 Admin Operations
- **Outreach Schedule** — Schedule calls, send emails, calendar integration
- **Active Clients** — List onboarding records, send messages
- **Onboarding Pipeline** — Pipeline view (nav disabled)
- **Email Templates, Reports, Settings** — Stubs (nav disabled)

---

## 7. Services Layer

| Service | Responsibility |
|---------|----------------|
| `api.ts` | Shared Axios instance, JWT interceptors, token refresh |
| `calendarService.ts` | Landing/contact calendar events |
| `onboardingCalendarService.ts` | Onboarding call scheduling, availability |
| `emailService.ts` | Email template builders, provider config |
| `onboardingScheduleEmailService.ts` | Onboarding confirmation emails |
| `outreachScheduleEmailService.ts` | Admin outreach call emails |
| `npiRegistryService.ts` | NPI lookup, taxonomy mapping |
| `onboardingClientAuthService.ts` | OTP login, client session |
| `onboardingStorageService.ts` | Step-bucketed localStorage schema |
| `onboardingHydrationService.ts` | Server → local state merge |
| `onboardingAdminService.ts` | Admin onboarding record fetch |
| `onboardingSecurityService.ts` | Idle timeout, session cleanup |
| `outreachScheduleService.ts` | Derive outreach calendar from records |

---

## 8. External Integrations

| Integration | Usage | Notes |
|-------------|-------|-------|
| Google Calendar | Onboarding & admin call scheduling | Backend proxies Calendar API |
| Calendly | ContactUs, ScheduleCall pages | react-calendly embed |
| reCAPTCHA | Contact form | VITE_RECAPTCHA_SITE_KEY |
| NPI Registry | Early access, onboarding step 1 | Backend proxy to CMS |
| Email (SMTP/SendGrid/SES) | OTP, confirmations, outreach | Backend relay |
| Zoho Pay | Step 6 banking | **UI mock only** — no live API |

---

## 9. Security Features

### Implemented

| Feature | Location | Description |
|---------|----------|-------------|
| JWT auth + refresh | AuthContext, api.ts | Bearer tokens, 401 retry with refresh |
| Encrypted session storage | sessionStorage.ts | AES obfuscation for tokens (crypto-js) |
| Session timeout | SessionTimeout component | 30 min session, 25 min warning |
| Idle timeout (onboarding) | useOnboardingSessionGuard | 9 min warning, 10 min auto-logout |
| OTP verification | Login, register, early access | Email OTP for sensitive flows |
| Onboarding route guard | OnboardingProtectedRoute | Requires valid client session |
| Role-based access | ProtectedRoute | admin vs user route separation |
| CSRF token utilities | security.ts | Client-generated CSRF tokens |
| Input sanitization | security.ts | InputSanitizer class |
| Rate limiting (client) | security.ts | RateLimiter class |
| Security monitor | securityMonitor.ts | Suspicious activity, concurrent sessions, token reuse |
| reCAPTCHA | ContactForm | Bot protection on contact |
| Device ID tracking | sessionStorage.ts | Per-browser device fingerprint |

### Security Gaps / Concerns

| Issue | Risk | Recommendation |
|-------|------|----------------|
| CSP/security headers disabled | XSS, clickjacking | Enable CSP via server headers in production |
| Hardcoded encryption key | Token exposure if key leaked | Use HttpOnly cookies; server-side sessions |
| Admin tokens in plain localStorage | XSS can steal admin tokens | Move to HttpOnly cookies or secure storage |
| Token refresh logout disabled | Stale sessions persist | Re-enable logout on refresh failure |
| Client-side encryption | Obfuscation only, not real security | Rely on HTTPS + server-side auth |
| Demo mode (`VITE_ENABLE_DEMO_MODE`) | Mock login bypass | Disable in production |
| Zoho Pay mock | No real payment validation | Integrate Zoho SDK before go-live |
| Dual auth systems | Complexity, inconsistent security | Consolidate admin auth paths |

---

## 10. Scalability Analysis

### Current Strengths

- **SPA + REST** — Stateless frontend scales horizontally via CDN/static hosting
- **Vite build** — Fast builds, code splitting potential
- **Service layer** — Clear separation of API concerns
- **Step-based onboarding** — Incremental persistence reduces data loss
- **Backend proxy** — NPI, calendar, email offloaded to server

### Scalability Limitations

| Area | Limitation | Impact |
|------|------------|--------|
| Monolithic DyadOnboarding.tsx | ~3,300 lines, single component | Hard to maintain, slow to load |
| localStorage persistence | Client-only, no sync across devices | Poor multi-device UX |
| No global state library | Context + localStorage only | Complex state as app grows |
| No caching layer | Every navigation may re-fetch | Unnecessary API load |
| No pagination/virtualization | Admin lists may grow | Performance degradation |
| Synchronous hydration | Full onboarding record loaded at once | Slow for large records |
| Single backend assumption | No multi-region, no CDN for API | Latency for distant users |

### Scalability Recommendations

1. **Split DyadOnboarding** into step-specific routes or lazy-loaded chunks
2. **Introduce React Query/SWR** for API caching and background sync
3. **Server-side sessions** with Redis for onboarding state
4. **CDN** for static assets and API edge caching where applicable
5. **Pagination** for admin lists (early access, active clients)
6. **WebSocket or SSE** for real-time admin updates (optional)
7. **Micro-frontends** only if team/product boundaries justify it

---

## 11. Pros and Cons

### Pros

| # | Advantage |
|---|-----------|
| 1 | **Modern stack** — React 19, TypeScript, Vite for fast development |
| 2 | **Clear domain separation** — landing, early access, onboarding, admin |
| 3 | **Multi-step onboarding** — Structured 6-step flow with progress persistence |
| 4 | **Multiple auth paths** — Supports public, admin, and client-specific flows |
| 5 | **Security utilities** — Session timeout, idle guard, OTP, role-based routes |
| 6 | **External integrations** — Calendar, NPI, email, Calendly wired in |
| 7 | **Offline resilience** — localStorage draft saves during onboarding |
| 8 | **Form validation** — React Hook Form + Yup for robust validation |
| 9 | **Admin tooling** — Outreach schedule, active clients, email templates |
| 10 | **Dev proxy** — Vite proxy simplifies local API development |

### Cons

| # | Disadvantage |
|---|--------------|
| 1 | **Monolithic onboarding page** — Single large file, hard to test and refactor |
| 2 | **Three auth systems** — Inconsistent patterns, security surface area |
| 3 | **Client-side token storage** — Vulnerable to XSS; not production-grade |
| 4 | **Security headers disabled** — CSP and XSS protection not active |
| 5 | **Mock integrations** — Zoho Pay, demo mode not production-ready |
| 6 | **No automated tests** — No test suite in package.json |
| 7 | **Mixed styling** — Tailwind + large custom CSS files, inconsistent |
| 8 | **API URL inconsistency** — Some services use raw axios, others api instance |
| 9 | **Disabled admin features** — Pipeline, reports, settings not implemented |
| 10 | **Backend coupling** — Frontend assumes specific REST contract; no OpenAPI client |

---

## 12. Data Flow Summary

```
User Action → Component → Service → Axios → Backend API
                ↓
         localStorage (onboarding draft)
                ↓
         SecureSessionStorage (auth tokens)
                ↓
         Hydration on load (server → local merge)
```

---

## 13. Deployment Assumptions

- **Frontend:** Static build (`npm run build`) → CDN or static host (Vercel, Netlify, S3+CloudFront)
- **Backend:** Node server (e.g., Railway) at configurable `VITE_API_URL`
- **Env vars:** VITE_API_URL, VITE_RECAPTCHA_SITE_KEY, VITE_GOOGLE_CALENDAR_ID, email provider vars
- **CORS:** Backend must allow frontend origin

---

## 14. Conclusion

Dyad Practice Solutions is a feature-rich healthcare enrollment SPA with a well-defined service layer and multi-step onboarding flow. It is suitable for early-access and pilot deployments but requires security hardening (HttpOnly cookies, CSP, consolidated auth), refactoring of the onboarding monolith, and completion of mock integrations (Zoho Pay) before production scale.

**Overall assessment:** Solid foundation for MVP/pilot; needs architectural refinement and security improvements for enterprise scale.

---

*Report generated from codebase analysis. For questions, refer to source in `src/` and service documentation in `src/services/api-docs.md`.*
