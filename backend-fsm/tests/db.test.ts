import { beforeAll, beforeEach, describe, it, expect } from 'bun:test';

import { deriveKeyFromPassphrase, setSessionKey, generateSalt } from '@security/keyManager';
import * as profileRepo from '@db/repositories/profile.repo';
import * as checkinRepo from '@db/repositories/checkin.repo';
import * as snapshotRepo from '@db/repositories/snapshot.repo';
import { db } from '@db/dexie.client';
import type { UserProfile, CheckInRecord, FsmSnapshot } from '../src/types/global';

let testSaltBase64: string;

beforeAll(async () => {
    const salt = generateSalt();
    const key = await deriveKeyFromPassphrase('test-passphrase-not-real', salt);
    setSessionKey(key);
    testSaltBase64 = btoa(String.fromCharCode(...salt));
});

beforeEach(async () => {
    await db.profiles.clear();
    await db.checkins.clear();
    await db.snapshots.clear();
});

describe('profile.repo', () => {
    it('saves and retrieves a profile, correctly encrypted and decrypted', async () => {
        const profile: UserProfile = {
            id: 'test-profile-1',
            displayName: 'Test User',
            ageRange: '18-24',
            createdAt: Date.now(),
            themePreference: 'companion',
        };

        await profileRepo.save(profile, testSaltBase64);
        const retrieved = await profileRepo.getById('test-profile-1');

        expect(retrieved).toEqual(profile);
    });

    it('returns null for a profile that does not exist', async () => {
        const result = await profileRepo.getById('does-not-exist');
        expect(result).toBeNull();
    });

    it('the raw stored record is actually encrypted, not plaintext', async () => {
        const profile: UserProfile = {
            id: 'test-profile-2',
            displayName: 'Sensitive Name',
            ageRange: '25-34',
            createdAt: Date.now(),
            themePreference: 'aesthetic',
        };

        await profileRepo.save(profile, testSaltBase64);
        const raw = await db.profiles.get('test-profile-2');

        expect(raw).toBeDefined();
        expect(raw!.displayName).not.toBe('Sensitive Name');
        expect(typeof raw!.displayName).toBe('object'); // EncryptedPayload, not a plain string
    });

    it('getSalt returns the salt without needing a session key', async () => {
        const profile: UserProfile = {
            id: 'test-profile-3',
            displayName: 'Another User',
            ageRange: '35+',
            createdAt: Date.now(),
            themePreference: 'companion',
        };

        await profileRepo.save(profile, testSaltBase64);
        const salt = await profileRepo.getSalt('test-profile-3');

        expect(salt).toBe(testSaltBase64);
    });
});

describe('checkin.repo', () => {
    it('saves and retrieves check-ins for a profile, newest first', async () => {
        const older: CheckInRecord = {
            id: 'checkin-1',
            profileId: 'profile-x',
            timestamp: 1000,
            mood: 'okay',
        };
        const newer: CheckInRecord = {
            id: 'checkin-2',
            profileId: 'profile-x',
            timestamp: 2000,
            mood: 'good',
            notes: 'feeling better today',
        };

        await checkinRepo.save(older);
        await checkinRepo.save(newer);

        const results = await checkinRepo.getAllForProfile('profile-x');

        expect(results).toHaveLength(2);
        expect(results[0]!.id).toBe('checkin-2'); // newest first
        expect(results[0]!.notes).toBe('feeling better today');
        expect(results[1]!.id).toBe('checkin-1');
        expect(results[1]!.notes).toBeUndefined(); // no notes were given
    });

    it('does not fetch check-ins belonging to a different profile', async () => {
        await checkinRepo.save({
            id: 'checkin-3',
            profileId: 'profile-y',
            timestamp: 3000,
            mood: 'meh',
        });

        const results = await checkinRepo.getAllForProfile('profile-x');
        expect(results.every((r) => r.profileId === 'profile-x')).toBe(true);
    });
});

describe('snapshot.repo', () => {
    it('saves and restores a snapshot for a profile', async () => {
        const snapshot: FsmSnapshot = {
            id: 'profile-z',
            profileId: 'profile-z',
            savedAt: Date.now(),
            serializedState: JSON.stringify({ some: 'state' }),
        };

        await snapshotRepo.save(snapshot);
        const restored = await snapshotRepo.getForProfile('profile-z');

        expect(restored).toEqual(snapshot);
    });

    it('returns null when no snapshot exists for a profile', async () => {
        const result = await snapshotRepo.getForProfile('never-saved');
        expect(result).toBeNull();
    });
});