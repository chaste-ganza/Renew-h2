import { db } from '@db/dexie.client';
import { type EncryptedPayload, encryptField, decryptField } from '@security/crypto.services';
import { getSessionKey } from '@security/keyManager';
import type { UserProfile } from '../../types/global';

interface StoredProfile {
    id: string;
    displayName: EncryptedPayload;
    ageRange: EncryptedPayload;
    createdAt: number;
    themePreference: UserProfile['themePreference'];
}

async function toStoredProfile(profile: UserProfile): Promise<StoredProfile> {
    const key = getSessionKey();

    const [encryptedName, encryptedAge] = await Promise.all([
        encryptField(profile.displayName, key),
        encryptField(profile.ageRange, key),
    ]);

    return {
        id: profile.id,
        displayName: encryptedName,
        ageRange: encryptedAge,
        createdAt: profile.createdAt,
        themePreference: profile.themePreference,
    };
}

async function fromStoredProfile(stored: StoredProfile): Promise<UserProfile> {
    const key = getSessionKey();

    const [displayName, ageRange] = await Promise.all([
        decryptField(stored.displayName, key),
        decryptField(stored.ageRange, key),
    ]);

    return {
        id: stored.id,
        displayName,
        ageRange: ageRange as UserProfile['ageRange'],
        createdAt: stored.createdAt,
        themePreference: stored.themePreference,
    };
}

export async function save(profile: UserProfile): Promise<void> {
    const stored = await toStoredProfile(profile);
    await db.profiles.put(stored);
}

export async function getById(id: string): Promise<UserProfile | null> {
    const stored = await db.profiles.get(id);
    if (!stored) return null;
    return fromStoredProfile(stored);
}

export async function remove(id: string): Promise<void> {
    await db.profiles.delete(id);
}