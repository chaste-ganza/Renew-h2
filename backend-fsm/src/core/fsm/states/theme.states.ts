import type { AppContext } from "../types";
import type { UserProfile } from "../../../types/global";

export type AppEvent =
    | { type: 'ONBOARDING_NEXT' }
    | { type: 'ONBOARDING_PASSPHRASE_SET'; saltBase64: string }
    | { type: 'ONBOARDING_AGE_SUBMITTED'; ageRange: UserProfile['ageRange'] }
    | { type: 'ONBOARDING_THEME_SELECTED'; theme: UserProfile['themePreference'] }
    | { type: 'THEME_CHANGED'; theme: UserProfile['themePreference'] }   // ← NEW
    | { type: 'CHECKIN_STARTED' }
    | { type: 'CHECKIN_MOOD_SELECTED'; mood: string }
    | { type: 'CHECKIN_FOLLOWUP_SUBMITTED'; notes?: string }
    | { type: 'CHECKIN_RESET' }
    | { type: 'SOS_TRIGGERED' }
    | { type: 'SOS_CONSENT_GRANTED' }
    | { type: 'SOS_CONSENT_DENIED' }
    | { type: 'SOS_CALL_CONNECTED' }
    | { type: 'SOS_CANCELLED' };

export function applyThemeChange(
    context: AppContext,
    theme: UserProfile['themePreference']
): AppContext {
    if (!context.profile) {
        return context;
    }

    return {
        ...context,
        profile: { ...context.profile, themePreference: theme },
    };
}