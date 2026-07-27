import { useEffect, useState } from 'react';
import * as emitterModule from 'backend-fsm/emitter';
import type { EngineSnapshot } from 'backend-fsm/emitter';

const NOOP_UNSUBSCRIBE = () => undefined;

const DEFAULT_SNAPSHOT: EngineSnapshot = {
  state: 'idle',
  uiConfig: {},
  dispatch: () => undefined,
};

function resolveSubscribe(): (listener: (snapshot: EngineSnapshot) => void) => () => void {
  const candidate = (emitterModule as Partial<typeof emitterModule>).subscribe;
  return typeof candidate === 'function' ? candidate : () => NOOP_UNSUBSCRIBE;
}

function resolveGetSnapshot(): () => EngineSnapshot | null {
  const candidate = (emitterModule as Partial<typeof emitterModule>).getSnapshot;
  return typeof candidate === 'function' ? candidate : () => null;
}

/**
 * The sanctioned React hook for reading FSM state.
 * Subscribes only to backend-fsm/src/core/fsm/emitter.ts — never FSM internals.
 */
export function useFsmState(): EngineSnapshot {
  const subscribe = resolveSubscribe();
  const getSnapshot = resolveGetSnapshot();

  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => {
    return getSnapshot() ?? DEFAULT_SNAPSHOT;
  });

  useEffect(() => {
    const unsubscribe = subscribe((next) => {
      setSnapshot(next);
    });

    return unsubscribe;
  }, [subscribe]);

  return snapshot;
}
