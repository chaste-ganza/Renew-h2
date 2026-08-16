import * as profileRepo from '../../../db/repositories/profile.repo';
import * as checkinRepo from '../../../db/repositories/checkin.repo';
import * as snapshotRepo from '../../../db/repositories/snapshot.repo';
import { recordConsent } from '../../../emergency/consent';
import { saveBootstrapRecord } from '../../../security/bootstrap';
import { getDiversifiedCheckInQuestion } from '../../../ai/inference.service';
import type { AppContext } from '../../../core/fsm/types';
import type { UserProfile } from '../../../types/global';

const DEFAULT_CHECKIN_QUESTION = 'How are you feeling today?';

/**
 * Executes the side effects named in an `effects` array (as returned
 * by transition()). This is the ONLY place in the FSM subsystem that
 * is allowed to call db/repositories/*, security/*, ai/*, or
 * emergency/* directly.
 */
export async function runSideEffects(
    effects: string[] | undefined,
    context: AppContext
): Promise<AppContext> {
    if (!effects || effects.length === 0) return context;

    let updatedContext = context;

    for (const effect of effects) {
        switch (effect) {
            case 'CREATE_PROFILE':
                updatedContext = await handleCreateProfile(updatedContext);
                break;

            case 'SAVE_CHECKIN':
                updatedContext = await handleSaveCheckIn(updatedContext);
                break;

            case 'PERSIST_SNAPSHOT':
                await handlePersistSnapshot(updatedContext);
                break;

            case 'RECORD_CONSENT':
                await handleRecordConsent(updatedContext);
                break;

            case 'GENERATE_CHECKIN_QUESTION':
                updatedContext = await handleGenerateCheckInQuestion(updatedContext);
                break;

            default:
                console.warn(`[sideEffects] Unknown effect: "${effect}"`);
        }
    }

    return updatedContext;
}

/**
 * Builds a real UserProfile from the partial data collected during
 * onboarding, assigns it a fresh id/timestamp, saves it via
 * profileRepo, and persists the unencrypted bootstrap pointer record
 * (profileId + salt) so the NEXT app launch knows to try unlocking
 * this profile. Returns the updated context with the complete profile
 * attached and pendingSalt cleared (spent).
 *
 * REQUIRES context.pendingSalt to have been set already — this
 * happens when security/session.ts's beginNewSession() runs during
 * the PassphraseSetup onboarding step.
 */
async function handleCreateProfile(context: AppContext): Promise<AppContext> {
    if (!context.pendingSalt) {
        throw new Error(
            '[sideEffects] Cannot create profile: no pendingSalt in context. ' +
            'beginNewSession() must run (and its salt stored in context.pendingSalt) ' +
            'before CREATE_PROFILE fires.'
        );
    }

    const ageRange = context.profile?.ageRange ?? '18-24';
    const themePreference = context.profile?.themePreference ?? 'companion';

    const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        displayName: context.profile?.displayName ?? 'Friend',
        ageRange,
        createdAt: Date.now(),
        themePreference,
    };

    await profileRepo.save(newProfile, context.pendingSalt);

    // Remember this profile's id + salt in plain localStorage so the
    // NEXT app launch knows there's an existing profile to unlock,
    // before any session key exists to decrypt Dexie with.
    saveBootstrapRecord({ profileId: newProfile.id, saltBase64: context.pendingSalt });

    return {
        ...context,
        profile: newProfile,
        pendingSalt: null,
    };
}

/**
 * Persists the current mood/notes sitting in context as a real
 * CheckInRecord. Requires an active profile and a selected mood.
 */
async function handleSaveCheckIn(context: AppContext): Promise<AppContext> {
    if (!context.profile || context.currentMood === null) {
        console.warn('[sideEffects] Cannot save check-in: missing profile or mood.');
        return context;
    }

    await checkinRepo.save({
        id: crypto.randomUUID(),
        profileId: context.profile.id,
        timestamp: Date.now(),
        mood: context.currentMood,
        ...(context.currentNotes !== null ? { notes: context.currentNotes } : {}),
    });

    return context;
}

/**
 * Persists the current machine state+context as a snapshot, so the
 * app can resume exactly here after the tab is closed and reopened.
 */
async function handlePersistSnapshot(context: AppContext): Promise<void> {
    if (!context.profile) {
        console.warn('[sideEffects] Cannot persist snapshot: no profile in context.');
        return;
    }

    await snapshotRepo.save({
        id: context.profile.id,
        profileId: context.profile.id,
        savedAt: Date.now(),
        serializedState: JSON.stringify(context),
    });
}

/**
 * Records an SOS consent event to the (unencrypted, audit-trail)
 * consentRecords table.
 */
async function handleRecordConsent(context: AppContext): Promise<void> {
    if (!context.profile) {
        console.warn('[sideEffects] Cannot record consent: no profile in context.');
        return;
    }
    await recordConsent(context.profile.id);
}

/**
 * Generates the (possibly AI-diversified) check-in question and
 * stores it in context.checkInQuestion for the frontend to display.
 * Falls back to the plain static question if there's no profile yet,
 * or if the AI pipeline fails/is unavailable (handled internally by
 * getDiversifiedCheckInQuestion's own safety net).
 */
async function handleGenerateCheckInQuestion(context: AppContext): Promise<AppContext> {
    if (!context.profile) {
        return { ...context, checkInQuestion: DEFAULT_CHECKIN_QUESTION };
    }

    const question = await getDiversifiedCheckInQuestion(
        DEFAULT_CHECKIN_QUESTION,
        context.profile.id,
        context.profile.ageRange
    );

    return { ...context, checkInQuestion: question };
}