import * as profileRepo from '@db/repositories/profile.repo';
import * as checkinRepo from '@db/repositories/checkin.repo'
import * as snapshotRepo from '@db/repositories/snapshot.repo';
import type { AppContext } from '@core/fsm/types';
import type { UserProfile } from '../../../types/global';
import { recordConsent } from '@emergency/consent';

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

            case 'PERSIST_SNAPSHOT':
                await handlePersistSnapshot(updatedContext);
                break;

            case 'SAVE_CHECKIN':
                updatedContext = await handleSaveCheckIn(updatedContext);
                break;

            case 'RECORD_CONSENT':
                await handleRecordConsent(updatedContext);
                break;

            default:
                console.warn(`[sideEffects] Unknown effect: "${effect}"`);
        }
    }

    return updatedContext;
}

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

    return {
        ...context,
        profile: newProfile,
        pendingSalt: null,
    };
}

async function handleSaveCheckIn(context: AppContext): Promise<AppContext> {
    if (!context.profile || context.currentMood == null) {
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

async function handleRecordConsent(context: AppContext): Promise<void> {
    if (!context.profile) {
        console.warn('[sideEffects] Cannot record consent: no profile in context.');
        return;
    }
    await recordConsent(context.profile.id);
}

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