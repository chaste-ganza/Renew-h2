import { transition } from './machine';
import { runSideEffects } from './actions/sideEffects';
import { initialState, initialContext, type AppState, type AppEvent, type MachineState } from './types';
import { getUiConfigForState, type UiConfig } from './uiConfig';

export interface EngineSnapshot {
    state: AppState;
    uiConfig: UiConfig;
}

type Listener = (snapshot: EngineSnapshot) => void;

class FsmEngine {
    private current: MachineState;

    private listeners: Set<Listener> = new Set();

    constructor() {
        this.current = { state: initialState, context: initialContext };
    }
    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        listener(this.getSnapshot());

        return () => {
            this.listeners.delete(listener);
        };
    }

    async dispatch(event: AppEvent): Promise<void> {
        const result = transition(this.current, event);
        const finalContext = await runSideEffects(result.effects, result.context);

        this.current = { state: result.state, context: finalContext };

        this.notify();
    }
    private getSnapshot(): EngineSnapshot {
        return {
            state: this.current.state,
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