/**
 * Compile-time contract for backend-fsm/src/core/fsm/emitter.ts.
 * The emitter stub may export nothing at runtime; useFsmState handles that gracefully.
 */
declare module 'backend-fsm/emitter' {
  export interface EngineSnapshot {
    state: string;
    uiConfig: Record<string, unknown>;
    dispatch: (event: unknown) => void;
  }

  export function subscribe(listener: (snapshot: EngineSnapshot) => void): () => void;
  export function getSnapshot(): EngineSnapshot | null;
}

declare module 'backend-fsm/types' {
  export type AppState = string;
  export type AppEvent = unknown;
  export type UiConfigForState = Record<string, unknown>;
}
