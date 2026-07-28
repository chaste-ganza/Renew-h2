import type { AppContext, AppEvent, AppState } from "../types";
import type { TransitionResult } from "./onboarding.states";
import type { SeverityLevel } from "../../../ai/inference.service";

export function handleCheckInTransition(
    state: Extract<AppState, { domain: 'CheckIn' }>,
    context: AppContext,
    event: AppEvent,
): TransitionResult {
    switch (state.step) {
        case 'MoodSelect':
            if (event.type === 'CHECKIN_MOOD_SELECTED') {
                return {
                    state: { domain: 'CheckIn', step: 'FollowUp' },
                    context: {
                        ...context,
                        currentMood: event.mood,
                    },
                };
            }
            break;

        case 'FollowUp':
            if (event.type === 'CHECKIN_TEXT_ANALYZED') {
                return {
                    state,
                    context: {
                        ...context,
                        latestTextAnalysis: event.analysis,
                    },
                    effects: effectsForSeverity(event.analysis.severity),
                };
            }

            if (event.type === 'CHECKIN_FOLLOWUP_SUBMITTED') {
                return {
                    state: { domain: 'CheckIn', step: 'Saved' },
                    context: {
                        ...context,
                        currentNotes: event.notes ?? null,
                    },
                    effects: ['SAVE_CHECKIN'],
                };
            }
            break;

        case 'Saved':
            if (event.type === 'CHECKIN_RESET') {
                return {
                    state: { domain: 'CheckIn', step: 'MoodSelect' },
                    context: {
                        ...context,
                        currentMood: null,
                        currentNotes: null,
                        latestTextAnalysis: null,
                    },
                };
            }
            break;
    }

    return { state, context };
}

function effectsForSeverity(severity: SeverityLevel): string[] {
    if (severity === 'crisis') return ['ROUTE_TO_SOS_CONSENT'];
    if (severity === 'high') return ['SURFACE_SUPPORT_OPTIONS'];
    if (severity === 'moderate') return ['SUGGEST_COPING_BREAK'];
    return [];
}
