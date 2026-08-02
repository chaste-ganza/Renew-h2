# ReNew

A privacy-first, on-device companion app for managing substance cravings and mental health lows.

This project merges the core ReNew privacy mission with the accessibility-first PANACEA concept. It is designed to be a safe space without the pressure of public feeds, accounts, or punishing streak mechanics.

## Architecture & Context

This repository currently houses the **frontend** application. 

- **Framework**: React (via Vite)
- **Styling**: Vanilla CSS Modules with a strict, fluid design system (no Tailwind, no hardcoded colors/px values outside of `tokens.css`).
- **State Management (FSM)**: The app logic is driven by a deterministic Finite State Machine (FSM). 
  - *Note: We are currently using a mock FSM reducer in `frontend/src/hooks/useFsmState.ts` until the backend FSM logic is integrated.*
- **Navigation**: Inspired by Daylio and Sanvello. It uses a 4-tab bottom navigation bar (`Home`, `History`, `Find`, `Progress`) with an elevated Floating Action Button (FAB) for quick entries, and a globally fixed `SOS` button.
- **Privacy**: No phone numbers, no emails, no public social feeds. All history and check-in data remains strictly on the device.
- **Accessibility**: Built with `prefers-reduced-motion` support, `aria-live` screen-reader announcements for state changes, and large tap targets for users in heightened emotional states.

## Getting Started

### Prerequisites
You will need [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/) installed. The project currently prefers `bun` for package management and testing.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   bun install
   # or npm install
   ```

### Running the App Locally

To start the Vite development server:
```bash
bun run dev
# or npm run dev
```
The app will be available at `http://localhost:5173`. 

### Testing & Linting

We maintain a strict quality bar. Tests assert against actual rendered text and structures, not just component names.

Run the test suite (Vitest + React Testing Library):
```bash
bun run test
# or bun run test --run (for a single pass without watch mode)
```

Run the linter (ESLint):
```bash
bun run lint
```

## Project Structure

- `frontend/src/components/`: Reusable, token-styled UI components (e.g., `BottomNav`).
- `frontend/src/screens/`: High-level views.
  - **Shell Screens**: `Home`, `History`, `SupportDirectory` (Find), `Progress`, `Settings`.
  - **FSM Flows (Full Screen)**: `Onboarding`, `CheckIn`, `CopingBreak`, `EvaluationSummary`, `TaskCard`, `PostActivity`, `SOS`.
- `frontend/src/hooks/useFsmState.ts`: The central state hub mapping mock FSM events to the UI.
- `frontend/src/styles/tokens.css`: The single source of truth for the app's visual design.

## Current Status
The `frontend shell`, `navigation`, `mock FSM flow`, and `accessibility features` have been implemented as an initial foundation, but the work is still in progress and not yet complete. We plan to continue revising, polishing, redesigning, and refining the user `experience`, `architecture`, and `overall implementation` as development progresses. The next major milestone is `integrating the actual backend-fsm engine to power the useFsmState hook`, replacing the current mock flow and enabling end-to-end functionality.