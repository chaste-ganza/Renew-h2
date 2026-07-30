export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
}
export function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}
export function base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}
export async function encryptField(
    plainText: string,
    key: CryptoKey
): Promise<EncryptedPayload> {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encoded = new TextEncoder().encode(plainText);

    const ciphertextBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    return {
        ciphertext: bufferToBase64(ciphertextBuffer),
        iv: bufferToBase64(iv.buffer),
    };
}
export async function decryptField(
    payload: EncryptedPayload,
    key: CryptoKey
): Promise<string> {
    const ciphertextBuffer = base64ToBuffer(payload.ciphertext);
    const ivBuffer = base64ToBuffer(payload.iv);

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(ivBuffer) },
        key,
        ciphertextBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
}