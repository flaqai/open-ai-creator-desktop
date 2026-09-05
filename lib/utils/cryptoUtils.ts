/**
 * Simple encryption utilities using Web Crypto API
 * Note: This provides basic protection against casual access to localStorage,
 * but cannot prevent XSS attacks from intercepting decrypted values or network requests.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const PREFIX = 'v2:';
const cachedKeys = new Map<string, Promise<CryptoKey>>();

/**
 * Derive encryption key from a passphrase
 */
async function deriveKeyUncached(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const id = passphrase + ':' + Array.from(salt).join(',');
  let key = cachedKeys.get(id);
  if (!key) {
    if (cachedKeys.size >= 2) cachedKeys.clear();
    key = deriveKeyUncached(passphrase, salt);
    cachedKeys.set(id, key);
    key.catch(() => cachedKeys.delete(id));
  }
  return key;
}

/**
 * Get or create device-specific salt
 */
function getDeviceSalt(): Uint8Array {
  const SALT_KEY = 'FLAQ-SAAS-TEMPLATE-device-salt';
  let saltHex = localStorage.getItem(SALT_KEY);

  if (!saltHex) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    saltHex = Array.from(salt)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(SALT_KEY, saltHex);
  }

  return new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
}

/**
 * Get device-specific passphrase (based on browser fingerprint)
 */
function getDevicePassphrase(): string {
  return `flaq-saas-${navigator.userAgent}-${navigator.language}`;
}

/**
 * Encrypt a string value
 */
export async function encryptValue(value: string): Promise<string> {
  try {
    const salt = getDeviceSalt();
    const passphrase = 'flaq-creator-storage-v2';
    const key = await deriveKey(passphrase, salt);

    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoder.encode(value));

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return (
      PREFIX +
      btoa(
        Array.from(combined)
          .map((b) => String.fromCharCode(b))
          .join(''),
      )
    );
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Could not encrypt settings. Nothing was stored.', { cause: error });
  }
}

/**
 * Decrypt a string value
 */
export async function decryptValue(encryptedValue: string): Promise<string> {
  try {
    const salt = getDeviceSalt();
    const isV2 = encryptedValue.startsWith(PREFIX);
    const passphrase = isV2 ? 'flaq-creator-storage-v2' : getDevicePassphrase();
    const key = await deriveKey(passphrase, salt);

    const combined = Uint8Array.from(atob(isV2 ? encryptedValue.slice(PREFIX.length) : encryptedValue), (c) =>
      c.charCodeAt(0),
    );
    const iv = combined.slice(0, IV_LENGTH);
    const encrypted = combined.slice(IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    if (encryptedValue.startsWith(PREFIX)) throw new Error('Could not decrypt stored settings.', { cause: error });
    // Backward compatibility for pre-encryption plaintext settings only.
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(encryptedValue) && encryptedValue.length >= 40) return '';
    return encryptedValue;
  }
}
