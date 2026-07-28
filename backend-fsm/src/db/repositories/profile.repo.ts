import { db } from "@db/dexie.client";
import { encryptField, decryptField, type EncryptedPayload } from "@security/crypto.services";
import { getSessionKey } from '@security/keyManager';
import type { UserProfiles } from '../../types/global';

export interface StoredProfile {
    id: string,
    displayName: EncryptedPayload,
    ageRange: EncryptedPayload,
    theme: UserProfiles["themePreferences"]
};