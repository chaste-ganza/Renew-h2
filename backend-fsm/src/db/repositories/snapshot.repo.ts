import { db } from '@db/dexie.client';
import { getSessionKey } from '@security/keyManager';
import { encryptField, decryptField } from '@security/crypto.services';
import type { FsmSnapshot, StoredFsmSnapshot } from '../../types/global';

async function toStoredSnapshot(snapshot: FsmSnapshot): Promise<StoredFsmSnapshot> {
    const key = getSessionKey();

    const serializedState = await encryptField(snapshot.serializedState, key);

    return {
        id: snapshot.id,
        profileId: snapshot.profileId,
        savedAt: snapshot.savedAt,
        serializedState,
    };
}

async function fromStoredSnapshot(stored: StoredFsmSnapshot): Promise<FsmSnapshot> {
    const key = getSessionKey();

    const serializedState = await decryptField(stored.serializedState, key);

    return {
        id: stored.id,
        profileId: stored.profileId,
        savedAt: stored.savedAt,
        serializedState,
    };
}
export async function save(snapshot: FsmSnapshot): Promise<void> {
    const stored = await toStoredSnapshot(snapshot);
    await db.snapshots.put(stored);
}

export async function getForProfile(profileId: string): Promise<FsmSnapshot | null> {
    const stored = await db.snapshots.where('profileId').equals(profileId).first();
    if (!stored) return null;
    return fromStoredSnapshot(stored);
}

export async function remove(profileId: string): Promise<void> {
    await db.snapshots.where('profileId').equals(profileId).delete();
}