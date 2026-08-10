/**
 * A tiny, UNENCRYPTED record living in localStorage (not Dexie —
 * deliberately separate, so it's readable before any session key
 * exists). Tells the app "there IS an existing profile, here's its
 * id and the salt needed to derive its key." Neither value is secret
 * on its own — profileId is a random UUID, salt's whole purpose is to
 * be public — so storing this in plain localStorage is safe.
 */
export interface BootstrapRecord {
    profileId: string;
    saltBase64: string;
}

const STORAGE_KEY = 'renew-bootstrap';

export function saveBootstrapRecord(record: BootstrapRecord): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function getBootstrapRecord(): BootstrapRecord | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as BootstrapRecord;
    } catch {
        // Corrupted localStorage entry — treat as "no record" rather than
        // crashing the whole app on boot.
        return null;
    }
}

/** Used for account deletion / full data wipe flows. */
export function clearBootstrapRecord(): void {
    localStorage.removeItem(STORAGE_KEY);
}