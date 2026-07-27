# ReNew Frontend

Privacy-first, offline-capable PWA shell for adolescent mental health check-ins. This package owns all UI — layouts, routing, styling, and React components. Domain logic lives in `backend-fsm/` and is consumed only through the FSM emitter contract.

## Quick start

From the repo root:

```bash
bun install
bun run dev      # frontend @ :5174, FSM test harness @ :5173
bun run test
bun run lint
```

## Integration contract

- **Runtime:** import only from `backend-fsm/emitter` (wrapped by `src/hooks/useFsmState.ts`). Never import FSM internals, Dexie, AI, or security modules directly.
- **Compile-time types:** path aliases `@core/*` and `@types/*` point at `../backend-fsm/src/` for shared type definitions only.

## CSS tokens and themes

Styling uses **Vanilla CSS + CSS Modules**. Global design tokens live in `src/styles/tokens.css`.

### Theme switching (`data-mode`)

Two age-based visual modes are supported via a `data-mode` attribute on `<html>`:

| Value | Audience | Palette prefix |
|---|---|---|
| `companion` | Younger adolescents (Companion Mode) | `--companion-*` |
| `ally` | Older adolescents (Ally / Aesthetic Mode) | `--ally-*` |

Each mode block maps source palette variables to semantic aliases (`--color-bg`, `--color-text`, `--color-primary`, etc.) so components never reference mode-specific names directly.

```html
<!-- index.html default -->
<html lang="en" data-mode="companion">
```

To switch at runtime (once the FSM theme state is wired):

```ts
document.documentElement.dataset.mode = 'ally'; // or 'companion'
```

### Shared scales

Mode-agnostic tokens on `:root`:

- **Spacing:** `--space-1` … `--space-8`
- **Radius:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`
- **Type:** `--font-size-xs` … `--font-size-2xl`, `--font-family-base` (system stack only)

### CSS Modules

Screen and component styles use `*.module.css` files colocated with their components. Always consume tokens via `var(--color-*)` / `var(--space-*)` — no hardcoded color or spacing values in modules.

## Directory layout

```
src/
├── screens/       # one folder per screen (placeholder components)
├── components/    # shared UI primitives (Button, Card, …)
├── hooks/         # useFsmState — sole FSM subscription hook
├── icons/         # self-hosted inline SVG components
├── styles/        # tokens.css, reset.css
├── App.tsx        # router + nav shell
└── main.tsx       # entry point
```

## PWA

Vite PWA plugin mirrors `backend-fsm` configuration (`registerType: 'autoUpdate'`, Workbox precaching). Manifest lives in `public/manifest.webmanifest`; replace placeholder icons in `public/icons/` before release.

## Fonts and icons

- **Fonts:** system stack only (`-apple-system`, Segoe UI, Roboto, sans-serif). No CDN web fonts.
- **Icons:** inline SVG React components in `src/icons/`. No icon-font CDNs.
