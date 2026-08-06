import type { EduSyncLocalDatabase } from '../database';

const MAX_PAYLOAD_BYTES = 1_048_576;
const SENSITIVE_KEY_PATTERN = /(?:password|motdepasse|mot_de_passe|token|authorization|cookie|secret|refresh|access.?token)/i;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export interface EncryptedOfflinePayload {
  encryptedPayload: string;
  initializationVector: string;
  encryptionVersion: 1;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function assertNoSensitiveKeys(value: unknown, visited = new WeakSet<object>(), depth = 0): void {
  if (depth > 20 || value === null || typeof value !== 'object') return;
  if (visited.has(value)) throw new Error('Les donnees hors ligne ne peuvent pas contenir de reference circulaire.');
  visited.add(value);

  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      throw new Error('Les secrets et donnees de session ne peuvent pas etre conserves hors ligne.');
    }
    assertNoSensitiveKeys(child, visited, depth + 1);
  }
}

async function getOrCreateKey(database: EduSyncLocalDatabase, partitionKey: string): Promise<CryptoKey> {
  const existing = await database.encryptionKeys.get(partitionKey);
  if (existing) return existing.key;

  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
  await database.encryptionKeys.put({
    partitionKey,
    key,
    createdAt: new Date().toISOString(),
  });
  return key;
}

export async function encryptOfflinePayload(
  database: EduSyncLocalDatabase,
  partitionKey: string,
  payload: unknown,
): Promise<EncryptedOfflinePayload> {
  assertNoSensitiveKeys(payload);
  const serialized = JSON.stringify(payload);
  if (serialized === undefined) throw new Error('Les donnees hors ligne sont invalides.');

  const clearBytes = encoder.encode(serialized);
  if (clearBytes.byteLength > MAX_PAYLOAD_BYTES) {
    throw new Error('Cette operation est trop volumineuse pour etre conservee hors ligne.');
  }

  const initializationVector = crypto.getRandomValues(new Uint8Array(12));
  const key = await getOrCreateKey(database, partitionKey);
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: initializationVector,
      additionalData: encoder.encode(partitionKey),
    },
    key,
    clearBytes,
  );

  return {
    encryptedPayload: bytesToBase64(new Uint8Array(encrypted)),
    initializationVector: bytesToBase64(initializationVector),
    encryptionVersion: 1,
  };
}

export async function decryptOfflinePayload<T>(
  database: EduSyncLocalDatabase,
  partitionKey: string,
  encryptedPayload: string,
  initializationVector: string,
): Promise<T> {
  const keyRecord = await database.encryptionKeys.get(partitionKey);
  if (!keyRecord) throw new Error('La cle locale de cette operation est indisponible.');

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToBytes(initializationVector),
      additionalData: encoder.encode(partitionKey),
    },
    keyRecord.key,
    base64ToBytes(encryptedPayload),
  );
  return JSON.parse(decoder.decode(decrypted)) as T;
}
