# ReNew — Backend FSM Engine (backend-fsm)

> The State Engine, Local Data Layer, AI Pipeline, and Security/Lifecycle
> module for ReNew — a 100% offline-first, privacy-first companion app.
> Built by the **Lead Backend & State Engineer**. UI is owned and built by
> a separate team (`frontend/`) consuming this engine's outputs.

---

## 1. Scope of This Repository

This module is **not** the whole ReNew app — it's the backend logic
engine that the `frontend/` team binds to. It contains **no page
layouts, no CSS, and no component design work.**

### What this module owns

| Area | Description |
|---|---|
| **State Engine (FSM/DFA)** | Deterministic state machine governing Onboarding, Check-In, and SOS Consent flows. Emits state + UI config that the frontend subscribes to. |
| **Local Storage & Data Layer** | Dexie.js / IndexedDB schema, encrypted data access objects (Profiles, Check-In Records, FSM Snapshots, Consent Records). |
| **In-Browser AI Engine** | WebLLM pipeline (`@mlc-ai/web-llm`) for adaptive question rephrasing — fully on-device, no cloud calls. *(Not yet started.)* |
| **Security, Privacy & Lifecycle** | Web Crypto encryption, passphrase-derived session keys, RAM auto-purge listeners, WebRTC connection *hooks* (not call UI). |

### What this module explicitly does NOT own

| Area | Owned by |
|---|---|
| Visual UI layouts, screens, components | `frontend/` team |
| Component styling, CSS, design system | `frontend/` team |
| Root-level shared config (`tsconfig.base.json`, `eslint.config.js`, etc.) | Whole team, edited by agreement only |

**The integration contract:** the frontend subscribes to this engine's
state + config output via `core/fsm/emitter.ts`, and sends user input
back in as events. It never reaches into FSM internals, Dexie, WebLLM,
or security code directly.

```
 frontend/ (React app)
        │
        │  engine.dispatch(event) ──────►  ┌────────────────────┐
        │                                   │   backend-fsm:      │
        │  ◄────── engine.subscribe() ──────│   FSM + DB + AI +   │
        │          (state + uiConfig)        │   Security Engine   │
        └─────────────────────────────────┴────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime / package manager | **Bun** | Install/build/dev/test runtime |
| Bundler / dev server | **Vite** | Dev server, HMR, bundling, PWA plugin |
| Language | **TypeScript** (strict mode, shared base config) | Type safety across FSM, DB, AI boundaries |
| State engine | Custom **Mealy machine** (hand-rolled) | Deterministic control of Onboarding, CheckIn, SOS flows |
| Storage | **IndexedDB** via **Dexie.js** | Local persistence of profiles, check-ins, snapshots, consent records |
| Local AI | **`@mlc-ai/web-llm`** (WebGPU) | On-device LLM for adaptive question rephrasing *(planned)* |
| Security | **Web Crypto API** (AES-GCM + PBKDF2) | Encrypt/decrypt sensitive fields; passphrase-derived session keys |
| Testing | **`bun:test`** | Unit tests for FSM transitions (Vitest used separately by `frontend/`) |
| Realtime hooks | **WebRTC** (connection/signaling only) | SOS emergency channel plumbing *(planned)* |

No backend server, no REST/GraphQL API, no cloud database — by design.

---

## 3. Project Structure

```
backend-fsm/
├── bun.lock
├── package.json
├── tsconfig.json              # extends ../tsconfig.base.json (shared, root-level)
├── vite.config.ts
├── vitest.config.ts           # excludes bun:test files; frontend/shared tooling
├── index.html
├── README.md
│
├── src/
│   ├── main.ts                        # boots the engine — NOT yet implemented
│   │
│   ├── core/
│   │   └── fsm/
│   │       ├── types.ts                 # State / Event / Context contract
│   │       ├── machine.ts               # pure transition engine + global event routing
│   │       ├── emitter.ts               # ★ the ONLY integration point for frontend/
│   │       ├── uiConfig.ts              # maps AppState -> UI-friendly render config
│   │       ├── states/
│   │       │   ├── onboarding.states.ts   # ✅ Welcome → PassphraseSetup → AgeInput → ThemeSelect → Complete
│   │       │   ├── checkin.states.ts      # ✅ MoodSelect → FollowUp → Saved
│   │       │   ├── theme.states.ts        # ⏳ not started
│   │       │   └── sos.states.ts          # ✅ ConsentPending → ConsentGranted → ConnectingCall
│   │       └── actions/
│   │           └── sideEffects.ts       # CREATE_PROFILE, SAVE_CHECKIN, PERSIST_SNAPSHOT, RECORD_CONSENT
│   │
│   ├── db/
│   │   ├── schema.ts                    # v2: profiles, checkins, snapshots, consentRecords
│   │   ├── dexie.client.ts
│   │   └── repositories/
│   │       ├── profile.repo.ts          # encrypted, requires saltBase64 on save
│   │       ├── checkin.repo.ts          # encrypted (mood, notes)
│   │       └── snapshot.repo.ts         # encrypted (whole serializedState blob)
│   │
│   ├── ai/                              # ⏳ not started
│   │   ├── webllm.client.ts
│   │   ├── prompt.templates.ts
│   │   └── inference.service.ts
│   │
│   ├── security/
│   │   ├── crypto.service.ts            # ✅ AES-GCM encrypt/decrypt via Web Crypto
│   │   ├── keyManager.ts                # ✅ PBKDF2 passphrase → session CryptoKey
│   │   ├── session.ts                   # ✅ beginNewSession() / unlockExistingSession()
│   │   ├── purge.ts                     # ✅ visibilitychange/beforeunload listeners — not yet CALLED from main.ts
│   │   └── webrtc/                      # ⏳ not started
│   │       ├── signaling.stub.ts
│   │       └── call.service.ts
│   │
│   ├── emergency/
│   │   └── consent.ts                   # ✅ consentRecords repo — deliberately UNencrypted (audit trail)
│   │
│   ├── types/
│   │   └── global.d.ts                  # UserProfile, CheckInRecord, FsmSnapshot, ConsentRecord + Stored* variants
│   │
│   └── test-harness/
│       └── index.html                   # ⏳ empty placeholder
│
└── tests/
    ├── fsm.test.ts                      # Unit tests for state machine transitions
    ├── db.test.ts                       # Unit tests for Dexie repositories
    └── ai.test.ts                       # Unit tests / mocks for AI pipeline output shape
---

## 4. Architectural Principles

### 4.1 The FSM is pure — no exceptions

`core/fsm/machine.ts` and `core/fsm/states/*` never import from `db/`,
`ai/`, or `security/`. Side effects are triggered through
`core/fsm/actions/sideEffects.ts`, which is the ONLY place allowed to
call repository functions. This keeps the machine 100% testable
without mocking databases or AI — proven out by `fsm.test.ts`.

### 4.2 Global vs. domain-scoped events

Most events (`ONBOARDING_NEXT`, `CHECKIN_MOOD_SELECTED`, etc.) are
handled by whichever domain the machine currently sits in. Two events
are **global** — checked in `machine.ts` *before* domain routing, so
they work from any state:

- `CHECKIN_STARTED` — jump into a check-in from anywhere
- `SOS_TRIGGERED` — the emergency flow must be reachable from
  literally any point in the app, no exceptions

Keeping this as a single, stable, well-typed surface means my internal
refactors (new states, new side effects, swapping the DB layer, etc.)
never break the UI team's code, as long as this contract doesn't change
shape.

Exposes `engine.subscribe(listener)` and `engine.dispatch(event)`.
Internal state is `private` — enforced by TypeScript, not just
convention. The frontend team should never import from `machine.ts`,
`db/`, `ai/`, or `security/` directly.

### 4.4 Encryption boundary

`security/crypto.service.ts` (AES-GCM) + `security/keyManager.ts`
(PBKDF2 passphrase-derived keys) handle all encrypt/decrypt. Each
repository (`profile.repo.ts`, `checkin.repo.ts`, `snapshot.repo.ts`)
converts between the plain in-memory type and its encrypted `Stored*`
counterpart — nothing outside the repository layer ever sees
ciphertext or ever calls Dexie directly.

**Exception:** `emergency/consent.ts`'s `consentRecords` table is
**deliberately unencrypted** — a consent audit trail needs to remain
provable even if a session key is ever lost, unlike content data
(moods, notes, names) where privacy is the priority.

### 4.5 Path aliases

```
@core/*      → src/core/*
@db/*        → src/db/*
@ai/*        → src/ai/*
@security/*  → src/security/*
@emergency/* → src/emergency/*
@types/*     → src/types/*
```

Defined in `tsconfig.json` (`paths`) and `vite.config.ts`
(`resolve.alias`) — must stay in sync. `tsconfig.json` extends the
shared root `tsconfig.base.json`; only module-specific settings
(`types: ["bun"]`, path aliases, `include`) live in this module's own
config.

---

## 5. Setup Instructions

```bash
cd backend-fsm
bun install
bun run dev
bun test
```

> **Windows users:** avoid OneDrive-synced folders (e.g. default
> `Documents`) — causes Vite dev-server restart loops. Clone/keep the
> repo on a plain local path.

---

## 6. Current Status

| Milestone | Status |
|---|---|
| Project scaffolding (Bun + Vite + TS) | ✅ Done |
| Role-scoped directory structure | ✅ Done |
| Dependencies installed (Dexie, WebLLM, PWA plugin) | ✅ Done |
| Core type definitions (`types/global.d.ts`, `core/fsm/types.ts`) | ✅ Done |
| FSM transition engine (`core/fsm/machine.ts`) | ✅ Done |
| Integration emitter (`core/fsm/emitter.ts`) | ⏳ Not started |
| Dexie schema & repositories | ⏳ Not started |
| Encryption / key management / RAM purge | ⏳ Not started |
| WebLLM integration | ⏳ Not started |
| WebRTC connection hooks | ⏳ Not started |
| `db.test.ts` / `ai.test.ts` | ⏳ Empty placeholders |
| `test-harness/index.html` | ⏳ Empty placeholder |

---

## 7. Data Model Overview (`src/types/global.d.ts`)

| Type | Purpose | Encrypted? |
|---|---|---|
| `UserProfile` | Decrypted, in-memory profile shape | Fields encrypted at rest (`displayName`, `ageRange`) |
| `CheckInRecord` | One check-in entry (mood, optional notes, timestamp) | Fields encrypted at rest (`mood`, `notes`) |
| `FsmSnapshot` | Serialized FSM `State` + `Context`, for resume-on-reload | Whole blob encrypted at rest |
| `ConsentRecord` | SOS consent audit entry (profileId, timestamp) | **Not encrypted** — audit trail durability |

Each has a corresponding `Stored*` type (`StoredProfile`,
`StoredCheckInRecord`, `StoredFsmSnapshot`) representing the actual
encrypted shape persisted in Dexie — only the relevant repository file
ever constructs or reads these directly.

---

## 8. Known Open Questions / Design Decisions Pending Team Input

- **`purgeOnHide` default** (`security/purge.ts`): should switching
  tabs/apps purge the session key immediately (stricter, more
  re-unlocking), or only on actual tab close (`beforeunload`, current
  default)? Worth deciding given this app's sensitive-data context.
- **Consent records left unencrypted** (`emergency/consent.ts`): a
  deliberate tradeoff favoring audit-trail durability over privacy for
  this one table. Flagging for team review.
- **Boot-time bootstrap record**: `main.ts` needs *some* small,
  unencrypted way to know which `profileId`/salt to attempt unlocking
  on app launch, before any session key exists. Not yet designed —
  candidates are `localStorage` or a small dedicated Dexie table.
- **No display-name collection step in onboarding**: `sideEffects.ts`
  currently falls back to a placeholder name (`"Friend"`). Decide
  whether a real name-entry step is needed, or whether this app should
  deliberately avoid asking for real names.

---

## 9. Integration Guidelines for the Frontend Team (Read-Only Reference)

- Import only from `core/fsm/emitter.ts` (the exported `engine`
  instance). Never import from `machine.ts`, `db/`, `ai/`, or
  `security/` directly.
- `engine.subscribe(listener)` — call once per component/mount; fires
  immediately with the current snapshot, then again on every
  `dispatch()`. Returns an unsubscribe function.
- `engine.dispatch(event)` — the only way to send user input in.
  `async` — side effects (Dexie writes) complete before subscribers
  are notified.
- Render from `snapshot.uiConfig`, not raw `snapshot.state`, wherever
  possible — `uiConfig` is designed to be UI-friendly and stable even
  if internal state names change.

---

## 10. Contribution Guidelines (Backend Engine Scope Only)

- Never call Dexie, WebLLM, or Web Crypto APIs directly from
  `core/fsm/` — route all side effects through
  `core/fsm/actions/sideEffects.ts`.
- All new states/events go into `core/fsm/types.ts` first.
- Sensitive data types must be encrypted via
  `security/crypto.service.ts` before being passed to any
  `db/repositories/*` save function — unless there's a deliberate,
  documented reason not to (see `emergency/consent.ts`).
- Run `bunx tsc --noEmit` and `bun test` clean before opening a PR.
- New logic in `core/fsm/` requires a corresponding test in
  `tests/fsm.test.ts`.
- Do not add UI components, CSS, or page layouts to this module.
- Flag open design decisions in commit messages / PR descriptions
  rather than deciding unilaterally on product-facing tradeoffs.

---

## 11. Privacy Principle

Zero network persistence: no analytics, no telemetry, no remote
logging, no cloud sync of user data. Any feature introducing a network
call to a third-party service must be flagged and reviewed against
this principle before merging.