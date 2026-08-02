import { db } from '@db/dexie.client';
import type { ConsentRecord } from '../types/global';

export async function recordConsent(profileId: string): Promise<void> {
    const record: ConsentRecord = {
        id: crypto.randomUUID(),
        profileId,
        grantedAt: Date.now(),
    };
    await db.consentRecords.add(record);
}

export async function getConsentHistory(profileId: string): Promise<ConsentRecord[]> {
    return db.consentRecords.where('profileId').equals(profileId).sortBy('grantedAt');
}