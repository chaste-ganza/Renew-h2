import type { AppState, AppEvent, AppContext } from '../../../core/fsm/types';
import type { TransitionResult } from './onboarding.states';

export function handleSosTransition(
    state: Extract<AppState, { domain: 'SOS' }>,
    context: AppContext,
    event: AppEvent
): TransitionResult {
    switch (state.step) {
        case 'Idle':
            break;

        case 'ConsentPending':
            if (event.type === 'SOS_CONSENT_GRANTED') {
                return {
                    state: { domain: 'SOS', step: 'ConsentGranted' },
                    context: { ...context, sosConsentTimestamp: Date.now() },
                    effects: ['RECORD_CONSENT'],
                };
            }
            if (event.type === 'SOS_CONSENT_DENIED') {
                return {
                    state: { domain: 'SOS', step: 'Idle' },
                    context: { ...context, sosConsentTimestamp: null },
                };
            }
            break;

        case 'ConsentGranted':
            if (event.type === 'SOS_CALL_CONNECTED') {
                return {
                    state: { domain: 'SOS', step: 'ConnectingCall' },
                    context,
                };
            }
            if (event.type === 'SOS_CANCELLED') {
                return {
                    state: { domain: 'SOS', step: 'Idle' },
                    context: { ...context, sosConsentTimestamp: null },
                };
            }
            break;

        case 'ConnectingCall':
            if (event.type === 'SOS_CANCELLED') {
                return {
                    state: { domain: 'SOS', step: 'Idle' },
                    context: { ...context, sosConsentTimestamp: null },
                };
            }
            break;
    }

    return { state, context };
}