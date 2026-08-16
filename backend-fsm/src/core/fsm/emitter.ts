import { transition } from './machine';
import { runSideEffects } from './actions/sideEffects';
import {
    initialState,
    initialContext,
    type AppState,
    type AppContext,
    type AppEvent,
    type MachineState,
} from './types';
import { getUiConfigForState, type UiConfig } from './uiConfig';

/**
 * What subscribers receive every time the machine's state changes.
 * This is the ENTIRE public contract the UI team depends on.
 */
export interface EngineSnapshot {
    state: AppState;
    context: AppContext;
    uiConfig: UiConfig;
}

type Listener = (snapshot: EngineSnapshot) => void;

/**
 * The FsmEngine class wraps the pure transition() function with
 * actual mutable state (held privately) and a subscription mechanism.
 * This is the ONLY place in the entire codebase where "the current
 * state" is allowed to live as a mutable variable.
 */
class FsmEngine {
    private current: MachineState;
    private listeners: Set<Listener> = new Set();

    constructor() {
        this.current = { state: initialState, context: initialContext };
    }

    /**
     * Registers a callback to be called on every state change. Returns
     * an unsubscribe function. Immediately calls the listener once with
     * the CURRENT snapshot, so a component doesn't have to wait for the
     * next dispatch to know what to render.
     */
    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        listener(this.getSnapshot());

        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * The single entry point for the UI to send input INTO the engine.
     * Async: runs the pure transition synchronously, then awaits any
     * side effects (Dexie writes, AI calls) before committing the new
     * state and notifying subscribers — so the UI never sees a state
     * that claims something happened before it actually did.
     */
    async dispatch(event: AppEvent): Promise<void> {
        const result = transition(this.current, event);

        try {
            const finalContext = await runSideEffects(result.effects, result.context);
            this.current = { state: result.state, context: finalContext };
        } catch (error) {
            console.error('[emitter] Side effect failed during dispatch:', error);
            this.current = { state: result.state, context: result.context };
        }

        this.notify();
    }

    /**
     * Replaces the engine's current state+context wholesale — used ONLY
     * during app boot, to restore a previously-saved snapshot after the
     * user unlocks their profile. Bypasses transition() entirely, since
     * there's no "event" that produced this state — it's a direct
     * restore, not a consequence of user input.
     */
    hydrate(state: MachineState): void {
        this.current = state;
        this.notify();
    }

    private getSnapshot(): EngineSnapshot {
        return {
            state: this.current.state,
            context: this.current.context,
            uiConfig: getUiConfigForState(this.current.state),
        };
    }

    private notify(): void {
        const snapshot = this.getSnapshot();
        for (const listener of this.listeners) {
            listener(snapshot);
        }
    }
}

export const engine = new FsmEngine();