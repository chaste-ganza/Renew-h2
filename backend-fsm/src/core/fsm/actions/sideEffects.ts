import * as profileRepo from '@db/repositories/profile.repo';
import * as snapshotRepo from '@db/repositories/snapshot.repo';
import type { AppContext } from '@core/fsm/types';
import type { UserProfile } from '../../../types/global';

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

            default:
                console.warn(`[sideEffects] Unknown effect: "${effect}"`);
        }
    }

    return updatedContext;
}

async function handleCreateProfile(context: AppContext): Promise<AppContext> {
    const ageRange = context.profile?.ageRange ?? '18-24'; // sensible fallback
    const themePreference = context.profile?.themePreference ?? 'companion';

    const newProfile: UserProfile = {
        id: crypto.randomUUID(),
        displayName: context.profile?.displayName ?? 'Friend', // placeholder until a display-name step exists
        ageRange,
        createdAt: Date.now(),
        themePreference,
    };

    await profileRepo.save(newProfile);

    return {
        ...context,
        profile: newProfile,
    };
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