import { engine } from '../src/core/fsm/emitter';
import { getBootstrapRecord } from '../src/security/bootstrap';
import { unlockExistingSession } from '../src/security/session';
import { initPurgeListeners } from '../src/security/purge';
import * as snapshotRepo from '../src/db/repositories/snapshot.repo';
import { initialContext, type MachineState } from '../src/core/fsm/types';

export type BootStatus =
    | { status: 'needs-onboarding' }
    | { status: 'needs-unlock'; profileId: string; saltBase64: string };

/**
 * The first thing the frontend should call on app load. Tells it
 * whether to show the onboarding flow or a passphrase-unlock screen.
 * Purely synchronous — just reads localStorage, no crypto/Dexie yet.
 */
export function getBootStatus(): BootStatus {
    const record = getBootstrapRecord();
    if (!record) return { status: 'needs-onboarding' };
    return { status: 'needs-unlock', profileId: record.profileId, saltBase64: record.saltBase64 };
}

/**
 * Called by the frontend once the user enters their passphrase on a
 * "needs-unlock" boot. Attempts to unlock, then restores their last
 * saved snapshot (if any) so they resume exactly where they left off.
 *
 * Returns true on success, false if the passphrase was wrong.
 */
export async function unlockAndResume(
    profileId: string,
    saltBase64: string,
    passphrase: string
): Promise<boolean> {
    try {
        await unlockExistingSession(profileId, passphrase, saltBase64);
    } catch {
        // Wrong passphrase — AES-GCM's built-in authentication caught it
        // during decryption inside profileRepo.getById().
        return false;
    }

    const snapshot = await snapshotRepo.getForProfile(profileId);

    if (snapshot) {
        const restored: MachineState = JSON.parse(snapshot.serializedState);
        engine.hydrate(restored);
    } else {
        engine.hydrate({
            state: { domain: 'CheckIn', step: 'MoodSelect' },
            context: initialContext,
        });
    }

    return true;
}

export function startFreshOnboarding(): void {
    // Intentionally empty — engine already begins at initialState/initialContext.
}

export function initEngine(): void {
    initPurgeListeners();
}