# ReNew — Backend FSM Engine (backend-fsm)

> The State Engine, Local Data Layer, AI Pipeline, and Security/Lifecycle
> module for ReNew — a 100% offline-first, privacy-first companion app.
> Built by the **Lead Backend & State Engineer**. UI is owned and built by
> a separate team consuming this engine's outputs.

---

## 1. Scope of This Folder

This folder is **not** the whole ReNew app — it's the backend logic
engine that the visual UI team binds to. It contains **no page layouts,
no CSS, and no component design work.**

### What this fold owns

| Area | Description |
|---|---|
| **State Engine (FSM/DFA)** | Deterministic state machine governing Onboarding, Adaptive Theme, Check-In routing, and SOS Consent logic. Emits state + UI config that other teams subscribe to. |
| **Local Storage & Data Layer** | Dexie.js / IndexedDB schema, encrypted data access objects (Profiles, Check-In Records, FSM Snapshots). |
| **In-Browser AI Engine** | WebLLM pipeline (`@mlc-ai/web-llm`) for adaptive question rephrasing/diversification based on user demographics — fully on-device, no cloud calls. |
| **Security, Privacy & Lifecycle** | Web Crypto API encryption, RAM auto-purge listeners (`visibilitychange`, `beforeunload`), and WebRTC connection/signaling *hooks* (not call UI). |

### What this repo explicitly does NOT own

| Area | Owned by |
|---|---|
| Companion Mode / Aesthetic Space visual layouts | UI team |
| Component styling, CSS, design system | UI team |
| Screen-level React/HTML views | UI team |

**The integration contract:** the UI team subscribes to this engine's
state + config output, and sends user input back in as events. They never
reach into FSM internals, Dexie, WebLLM, or security code directly — all
of that stays encapsulated here.

```
 UI Team's Components
        │
        │  dispatch(event) ──────────►  ┌────────────────────┐
        │                                │   THIS REPO:        │
        │  ◄────── snapshot/uiConfig ────│   FSM + DB + AI +   │
        │          (subscription)        │   Security Engine   │
        └────────────────────────────────┴────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime / package manager | **Bun** | Install/build/dev runtime |
| Bundler / dev server | **Vite** | Dev server, HMR, bundling, PWA plugin |
| Language | **TypeScript** (strict mode) | Type safety across FSM, DB, AI boundaries |
| State engine | Custom **Mealy machine** (hand-rolled) | Deterministic control of app-wide flows |
| Storage | **IndexedDB** via **Dexie.js** | Local persistence of profiles, check-ins, FSM snapshots |
| Local AI | **`@mlc-ai/web-llm`** (WebGPU) | On-device LLM for adaptive question rephrasing |
| Security | **Web Crypto API** | Encrypt/decrypt sensitive profile fields at rest |
| Realtime hooks | **WebRTC** (connection/signaling only) | SOS emergency channel plumbing |

No backend server, no REST/GraphQL API, no cloud database — by design.

---

## 3. Final Project Structure (Role-Scoped)

```
backend-fsm/
├── bun.lockb
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── README.md
│
├── src/
│   ├── main.ts                       # Boots the engine (FSM + DB + AI + Security init).
│   │                                    NOT a UI mount point — exposes the engine
│   │                                    for the UI team to import and subscribe to.
│   │
│   ├── core/
│   │   └── fsm/
│   │       ├── types.ts               # State, Event, Context type definitions — the FSM's contract
│   │       ├── machine.ts             # Pure transition engine — no I/O, no side effects
│   │       ├── emitter.ts             # ★ THE INTEGRATION BOUNDARY.
│   │       │                            Public subscribe()/dispatch() API + UI config output
│   │       │                            that the UI team binds their components to.
│   │       ├── states/
│   │       │   ├── onboarding.states.ts   # Onboarding flow states
│   │       │   ├── checkin.states.ts      # Check-in flow states
│   │       │   ├── theme.states.ts        # Adaptive theme state (Companion vs Aesthetic)
│   │       │   └── sos.states.ts          # SOS/emergency consent states
│   │       └── actions/
│   │           └── sideEffects.ts     # Effect handlers triggered BY the FSM
│   │                                    (persist snapshot, call AI, trigger encryption, etc.)
│   │
│   ├── db/
│   │   ├── schema.ts                   # Dexie table schema definitions
│   │   ├── dexie.client.ts             # Dexie database instance + version migrations
│   │   └── repositories/
│   │       ├── profile.repo.ts         # CRUD for UserProfile (encrypted fields in/out)
│   │       ├── checkin.repo.ts         # CRUD for CheckInRecord entries
│   │       └── snapshot.repo.ts        # Save/restore FSM state snapshots
│   │
│   ├── ai/
│   │   ├── webllm.client.ts            # WebLLM engine lifecycle (load model, init WebGPU)
│   │   ├── prompt.templates.ts         # Prompt templates: static question → adaptive rephrasing
│   │   └── inference.service.ts        # High-level API the FSM calls (e.g. `rephraseQuestion()`)
│   │
│   ├── security/
│   │   ├── crypto.service.ts           # Web Crypto API wrappers: encrypt/decrypt profile fields
│   │   ├── keyManager.ts               # Derives & holds session encryption key (never persisted raw)
│   │   ├── purge.ts                    # RAM-purge listeners (`visibilitychange`, `beforeunload`)
│   │   └── webrtc/
│   │       ├── signaling.stub.ts       # Connection/signaling hook (plumbing only, no call UI)
│   │       └── call.service.ts         # Establishes/tears down the data channel; UI team renders the call view
│   │
│   ├── emergency/
│   │   └── consent.ts                  # SOS consent capture logic (feeds into FSM as events)
│   │
│   ├── types/
│   │   └── global.d.ts                 # Shared interfaces (UserProfile, CheckInRecord, FsmSnapshot)
│   │
│   └── test-harness/
│       └── index.html                  # ★ Minimal, unstyled test wrapper — buttons/console log only,
│                                          used to manually verify FSM transitions without
│                                          waiting on the UI team's real components.
│
└── tests/
    ├── fsm.test.ts                      # Unit tests for state machine transitions
    ├── db.test.ts                       # Unit tests for Dexie repositories
    └── ai.test.ts                       # Unit tests / mocks for AI pipeline output shape
```

### What changed from the original full-app structure

- ❌ Removed `ui/components/`, `ui/themes/`, `ui/screens/` — not your responsibility.
- ❌ Removed `emergency/webrtc/` as a full call-UI folder — replaced with `security/webrtc/` as **connection hooks only** (signaling + data channel setup), since this falls under your "Security, Privacy & Lifecycle" and "WebRTC hooks" responsibility, not call UI.
- ✅ Added `core/fsm/emitter.ts` explicitly — this is the single most important file for avoiding conflicts with your teammates, since it's the *only* surface they should ever import from.
- ✅ Added `src/test-harness/` — a plain, unstyled HTML file for you to manually click through states during development, without needing to build or wait for real UI components.
- ✅ `main.ts` now described as booting the **engine**, not mounting an app UI — since the UI team owns the actual app shell.

---

## 4. Architectural Principles

### 4.1 The FSM is pure — no exceptions

`core/fsm/machine.ts` and `core/fsm/states/*` never import from `db/`,
`ai/`, or `security/`. The machine only knows `State`, `Event`, `Context`.
Side effects are triggered through `core/fsm/actions/sideEffects.ts`,
keeping the machine 100% testable without mocking databases or AI models.

### 4.2 `core/fsm/emitter.ts` is the ONE integration point

This is the boundary the UI team is told to depend on — and *only* this
file. It should expose something like:

```ts
interface EngineSnapshot {
  state: AppState;             // current FSM state
  uiConfig: UiConfigForState;  // what to render, derived from state
  dispatch: (event: AppEvent) => void;  // how UI sends input back
}
```

Keeping this as a single, stable, well-typed surface means your internal
refactors (new states, new side effects, swapping the DB layer, etc.)
never break the UI team's code, as long as this contract doesn't change
shape.

### 4.3 Nothing outside `db/` talks to Dexie directly

Only `db/repositories/*` call Dexie. The FSM calls `profileRepo.save(...)`,
never `db.table.add(...)` directly.

### 4.4 Sensitive fields are encrypted before they reach Dexie

Identity/consent data passes through `security/crypto.service.ts` before
being persisted, and is decrypted only in memory. Raw keys are never
persisted (`security/keyManager.ts`).

### 4.5 Path aliases

```
@core/*      → src/core/*
@db/*        → src/db/*
@ai/*        → src/ai/*
@security/*  → src/security/*
@emergency/* → src/emergency/*
@types/*     → src/types/*
```

Defined in both `tsconfig.json` (`compilerOptions.paths`) and
`vite.config.ts` (`resolve.alias`) — must stay in sync.

---

## 5. Setup Instructions

```bash
git clone <repo-url>
cd backend-fsm
bun install
bun run dev
```

Open `http://localhost:5173/src/test-harness/index.html` (once built) to
manually exercise FSM states without needing the real UI.

> **Windows users:** avoid OneDrive-synced folders (e.g. default
> `Documents`) — causes Vite dev-server restart loops and can corrupt
> `node_modules`. Use a plain local path like `C:\Dev\backend-fsm`.

---

## 6. Current Status

| Milestone | Status |
|---|---|
| Project scaffolding (Bun + Vite + TS) | ✅ Done |
| Role-scoped directory structure | ✅ Done |
| Dependencies installed (Dexie, WebLLM, PWA plugin) | ✅ Done |
| Core type definitions (`types/global.d.ts`, `core/fsm/types.ts`) | 🔄 In progress |
| FSM transition engine (`core/fsm/machine.ts`) | ⏳ Not started |
| Integration emitter (`core/fsm/emitter.ts`) | ⏳ Not started |
| Dexie schema & repositories | ⏳ Not started |
| Encryption / key management / RAM purge | ⏳ Not started |
| WebLLM integration | ⏳ Not started |
| WebRTC connection hooks | ⏳ Not started |
| Minimal test harness | ⏳ Not started |

---

## 7. Data Model Overview (`src/types/global.d.ts`)

| Type | Purpose |
|---|---|
| `UserProfile` | Decrypted, in-memory profile shape. Encrypted before persistence via `security/crypto.service.ts`. |
| `CheckInRecord` | A single check-in entry (mood, optional notes, timestamp), linked to a profile. |
| `FsmSnapshot` | Serialized FSM `State` + `Context`, allowing resume-on-reload. |

---

## 8. Integration Guidelines for the UI Team (Read-Only Reference)

- Import only from `core/fsm/emitter.ts`. Never import from `core/fsm/machine.ts`,
  `db/`, `ai/`, or `security/` directly.
- Subscribe to state changes; render based on `uiConfig`, not raw `state`
  where possible (config is designed to be UI-friendly; state is not).
- Send user actions back via `dispatch(event)` — never mutate engine state
  directly.
- Any new UI need (e.g. "we need a new field in the config output") should
  be requested as a change to `emitter.ts`'s output shape, not worked
  around in UI code.

---

## 9. Contribution Guidelines (Backend Engine Scope Only)

- Never call Dexie, WebLLM, or Web Crypto APIs directly from `core/fsm/` —
  route all side effects through `core/fsm/actions/sideEffects.ts`.
- All new states/events go into `core/fsm/types.ts` first, before any
  implementation references them.
- Sensitive data types must be encrypted via `security/crypto.service.ts`
  before being passed to any `db/repositories/*` save function.
- Run `bun run dev` and confirm a clean console before opening a PR.
- New logic in `core/fsm/` requires a corresponding test in `tests/fsm.test.ts`.
- Do not add UI components, CSS, or page layouts to this repo — that
  belongs in the UI team's repository/module.

---

## 10. Privacy Principle

Zero network persistence: no analytics, no telemetry, no remote logging,
no cloud sync of user data. Any feature introducing a network call to a
third-party service must be flagged and reviewed against this principle
before merging.
