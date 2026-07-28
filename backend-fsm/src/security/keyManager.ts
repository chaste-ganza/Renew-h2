let sessionKey: CryptoKey | null = null

export async function deriveKeyFromPassphrase(
    passphrase: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(passphrase),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt as BufferSource,
            iterations: 100_000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );

    return derivedKey;
}

export function setSessionKey(key: CryptoKey): void {
    sessionKey = key
}

export function getSessionKey(): CryptoKey {
    if (!sessionKey) {
        throw new Error(
            "No session Key set yet. User must unlock their profiles."
        )
    }
    return sessionKey;
}

export function clearSessionKey(): void {
    sessionKey = null;
}

export function generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
}