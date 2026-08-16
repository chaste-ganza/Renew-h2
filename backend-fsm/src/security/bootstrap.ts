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