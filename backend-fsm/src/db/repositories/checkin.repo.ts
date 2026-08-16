import { db } from '../../db/dexie.client';
import { encryptField, decryptField } from '../../security/crypto.services';
import { getSessionKey } from '../../security/keyManager';
import type { CheckInRecord, StoredCheckInRecord } from '../../types/global';

async function toStoredCheckIn(record: CheckInRecord): Promise<StoredCheckInRecord> {
    const key = getSessionKey();

    const [mood, notes] = await Promise.all([
        encryptField(record.mood, key),
        record.notes !== undefined ? encryptField(record.notes, key) : Promise.resolve(null),
    ]);

    return {
        id: record.id,
        profileId: record.profileId,
        timestamp: record.timestamp,
        mood,
        notes,
    };
}

async function fromStoredCheckIn(stored: StoredCheckInRecord): Promise<CheckInRecord> {
    const key = getSessionKey();

    const [mood, notes] = await Promise.all([
        decryptField(stored.mood, key),
        stored.notes !== null ? decryptField(stored.notes, key) : Promise.resolve(undefined),
    ]);

    return {
        id: stored.id,
        profileId: stored.profileId,
        timestamp: stored.timestamp,
        mood,
        ...(notes !== undefined ? { notes } : {}),
    };
}
export async function save(record: CheckInRecord): Promise<void> {
    const stored = await toStoredCheckIn(record);
    await db.checkins.put(stored);
}

export async function getAllForProfile(profileId: string): Promise<CheckInRecord[]> {
    const storedRecords = await db.checkins
        .where('profileId')
        .equals(profileId)
        .reverse()
        .sortBy('timestamp');

    return Promise.all(storedRecords.map(fromStoredCheckIn));
}

export async function remove(id: string): Promise<void> {
    await db.checkins.delete(id);
}