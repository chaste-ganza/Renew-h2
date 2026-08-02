import { useEffect, useState } from 'react';
import * as emitterModule from 'backend-fsm/emitter';
import type { EngineSnapshot } from 'backend-fsm/emitter';

/**
 * MOCK FSM IMPLEMENTATION
 * This powers the frontend until backend-fsm is integrated.
 */
let mockState: EngineSnapshot = {
  state: 'idle',
  uiConfig: {},
  dispatch: () => {}
};

const listeners = new Set<(snapshot: EngineSnapshot) => void>();

function notifyListeners() {
  listeners.forEach(l => l(mockState));
}

// Minimal mock reducer to demo the app flows
function mockReducer(currentState: string, event: unknown): string {
  // Use type assertion for mock internal event payload reading
  const e = event as { type: string; payload?: unknown };
  
  switch (currentState) {
    case 'idle':
      if (e.type === 'START_CHECKIN') return 'checkin_mood';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'checkin_mood':
      if (e.type === 'SELECT_MOOD') {
        const payload = e.payload as { isCalm: boolean };
        return payload.isCalm ? 'coping_break' : 'checkin_followup';
      }
      if (e.type === 'SKIP' || e.type === 'CANCEL') return 'idle';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'checkin_followup':
      if (e.type === 'SELECT_REASON') return 'checkin_intensity';
      if (e.type === 'SKIP' || e.type === 'CANCEL') return 'idle';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'checkin_intensity':
      if (e.type === 'SUBMIT') return 'coping_break';
      if (e.type === 'SKIP' || e.type === 'CANCEL') return 'idle';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'coping_break':
      if (e.type === 'COMPLETE' || e.type === 'SKIP') return 'evaluation_summary';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'evaluation_summary':
      if (e.type === 'CONTINUE' || e.type === 'SKIP') return 'task_card';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'task_card':
      if (e.type === 'COMPLETE' || e.type === 'SKIP') return 'post_activity';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'post_activity':
      if (e.type === 'SUBMIT' || e.type === 'SKIP') return 'idle';
      if (e.type === 'OPEN_SOS') return 'sos';
      break;
    case 'sos':
      if (e.type === 'CLOSE') return 'idle';
      break;
  }
  return currentState;
}

// Bind the mock dispatch
mockState.dispatch = (event: unknown) => {
  console.log('[Mock FSM] Event:', event);
  const nextState = mockReducer(mockState.state, event);
  if (nextState !== mockState.state) {
    mockState = { ...mockState, state: nextState };
    console.log('[Mock FSM] Transitioned to:', nextState);
    notifyListeners();
  }
};

function resolveSubscribe(): (listener: (snapshot: EngineSnapshot) => void) => () => void {
  const candidate = (emitterModule as Partial<typeof emitterModule>).subscribe;
  if (typeof candidate === 'function') return candidate;
  
  // Fallback to mock
  return (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
}

function resolveGetSnapshot(): () => EngineSnapshot | null {
  const candidate = (emitterModule as Partial<typeof emitterModule>).getSnapshot;
  if (typeof candidate === 'function') return candidate;
  
  // Fallback to mock
  return () => mockState;
}

export function useFsmState(): EngineSnapshot {
  const subscribe = resolveSubscribe();
  const getSnapshot = resolveGetSnapshot();

  const [snapshot, setSnapshot] = useState<EngineSnapshot>(() => {
    return getSnapshot() ?? mockState;
  });

  useEffect(() => {
    const unsubscribe = subscribe((next) => {
      setSnapshot(next);
    });

    return unsubscribe;
  }, [subscribe]);

  return snapshot;
}
