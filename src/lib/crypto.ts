import crypto from 'node:crypto';
import {
  DEFAULT_AES_ALGORITHM,
  SUPPORTED_AES_ALGORITHMS,
  AES_KEY_LENGTH_BYTES,
  AES_GCM_IV_LENGTH_BYTES,
  AES_CBC_IV_LENGTH_BYTES,
  AES_TAG_LENGTH_BYTES,
  AES_SALT_LENGTH_BYTES,
  PBKDF2_ITERATIONS,
  PBKDF2_DIGEST,
  ENCRYPTION_SERIALIZATION_PREFIX,
  DEFAULT_ENCRYPTION_SECRET_FALLBACK,
  CRYPTO_ERROR_MESSAGES,
} from '@/constants';
import type {
  AESAlgorithm,
  EncryptedDataBundle,
  EncryptionOptions,
  DecryptionOptions,
} from '@/types';
import { logger } from '@/lib/logger';

/**
 * Retrieve master secret from options, environment, or secure fallback
 */
export function getMasterSecret(optionsKey?: string): string {
  return (
    optionsKey ||
    process.env.ENCRYPTION_SECRET ||
    DEFAULT_ENCRYPTION_SECRET_FALLBACK
  );
}

/**
 * Derive a 256-bit (32-byte) cryptographic key using PBKDF2 with HMAC-SHA256
 */
export function deriveKey(
  secret: string,
  salt: Buffer,
  iterations = PBKDF2_ITERATIONS
): Buffer {
  return crypto.pbkdf2Sync(
    secret,
    salt,
    iterations,
    AES_KEY_LENGTH_BYTES,
    PBKDF2_DIGEST
  );
}

/**
 * Generate a cryptographically secure random key formatted as hex
 */
export function generateRandomKey(bytes = AES_KEY_LENGTH_BYTES): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Generate a deterministic HMAC-SHA256 blind index for searchable encryption
 */
export function generateBlindIndex(value: string, secret?: string): string {
  const hmacKey = getMasterSecret(secret);
  return crypto
    .createHmac('sha256', hmacKey)
    .update(value)
    .digest('hex');
}

/**
 * Encrypt arbitrary string or JSON object using AES (default: AES-256-GCM)
 */
export function encrypt(
  data: string | object,
  options?: EncryptionOptions
): EncryptedDataBundle {
  const startTime = Date.now();
  const algorithm: AESAlgorithm = options?.algorithm || DEFAULT_AES_ALGORITHM;

  if (!SUPPORTED_AES_ALGORITHMS.includes(algorithm)) {
    throw new Error(CRYPTO_ERROR_MESSAGES.UNSUPPORTED_ALGORITHM);
  }

  const plaintext =
    typeof data === 'object' && data !== null ? JSON.stringify(data) : String(data);

  // Generate or parse PBKDF2 salt
  let saltBuffer: Buffer;
  if (options?.salt) {
    saltBuffer =
      typeof options.salt === 'string'
        ? Buffer.from(options.salt, 'hex')
        : options.salt;
  } else {
    saltBuffer = crypto.randomBytes(AES_SALT_LENGTH_BYTES);
  }

  const derivedKey = deriveKey(getMasterSecret(options?.masterKey), saltBuffer);

  // Generate initialization vector (IV)
  const ivLength =
    algorithm === 'aes-256-gcm'
      ? AES_GCM_IV_LENGTH_BYTES
      : AES_CBC_IV_LENGTH_BYTES;
  const iv = crypto.randomBytes(ivLength);

  let ciphertextBuffer: Buffer;
  let tagBuffer: Buffer | undefined;

  if (algorithm === 'aes-256-gcm') {
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv, {
      authTagLength: AES_TAG_LENGTH_BYTES,
    });

    if (options?.aad) {
      cipher.setAAD(Buffer.from(options.aad, 'utf8'));
    }

    ciphertextBuffer = Buffer.concat([
      cipher.update(Buffer.from(plaintext, 'utf8')),
      cipher.final(),
    ]);

    tagBuffer = cipher.getAuthTag();
  } else {
    // aes-256-cbc
    const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);
    ciphertextBuffer = Buffer.concat([
      cipher.update(Buffer.from(plaintext, 'utf8')),
      cipher.final(),
    ]);
  }

  const durationMs = Date.now() - startTime;
  logger.debug('lib/crypto', `Data encrypted with ${algorithm}`, {
    algorithm,
    bytesProcessed: plaintext.length,
    durationMs,
  });

  return {
    algorithm,
    iv: iv.toString('hex'),
    tag: tagBuffer?.toString('hex'),
    salt: saltBuffer.toString('hex'),
    ciphertext: ciphertextBuffer.toString('hex'),
    aad: options?.aad,
  };
}

/**
 * Decrypt an EncryptedDataBundle or serialized bundle string back to plaintext
 */
export function decrypt(
  bundleOrSerialized: EncryptedDataBundle | string,
  options?: DecryptionOptions
): string {
  const startTime = Date.now();

  const bundle: EncryptedDataBundle =
    typeof bundleOrSerialized === 'string'
      ? deserializeBundle(bundleOrSerialized)
      : bundleOrSerialized;

  if (!SUPPORTED_AES_ALGORITHMS.includes(bundle.algorithm)) {
    throw new Error(CRYPTO_ERROR_MESSAGES.UNSUPPORTED_ALGORITHM);
  }

  const saltBuffer = Buffer.from(bundle.salt, 'hex');
  const ivBuffer = Buffer.from(bundle.iv, 'hex');
  const ciphertextBuffer = Buffer.from(bundle.ciphertext, 'hex');
  const derivedKey = deriveKey(getMasterSecret(options?.masterKey), saltBuffer);

  try {
    let decryptedBuffer: Buffer;

    if (bundle.algorithm === 'aes-256-gcm') {
      if (!bundle.tag) {
        throw new Error(CRYPTO_ERROR_MESSAGES.MISSING_AUTH_TAG);
      }

      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        derivedKey,
        ivBuffer,
        { authTagLength: AES_TAG_LENGTH_BYTES }
      );

      decipher.setAuthTag(Buffer.from(bundle.tag, 'hex'));

      const aad = options?.aad || bundle.aad;
      if (aad) {
        decipher.setAAD(Buffer.from(aad, 'utf8'));
      }

      decryptedBuffer = Buffer.concat([
        decipher.update(ciphertextBuffer),
        decipher.final(),
      ]);
    } else {
      // aes-256-cbc
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        derivedKey,
        ivBuffer
      );
      decryptedBuffer = Buffer.concat([
        decipher.update(ciphertextBuffer),
        decipher.final(),
      ]);
    }

    const durationMs = Date.now() - startTime;
    logger.debug('lib/crypto', `Data decrypted successfully with ${bundle.algorithm}`, {
      algorithm: bundle.algorithm,
      durationMs,
    });

    return decryptedBuffer.toString('utf8');
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg === CRYPTO_ERROR_MESSAGES.MISSING_AUTH_TAG) {
      throw error;
    }
    logger.warn('lib/crypto', 'Decryption failed: integrity or key mismatch', {
      algorithm: bundle.algorithm,
      error: errorMsg,
    });
    throw new Error(CRYPTO_ERROR_MESSAGES.CORRUPTED_CIPHERTEXT);
  }
}

/**
 * Decrypt and parse JSON payload
 */
export function decryptJson<T = unknown>(
  bundleOrSerialized: EncryptedDataBundle | string,
  options?: DecryptionOptions
): T {
  const plaintext = decrypt(bundleOrSerialized, options);
  return JSON.parse(plaintext) as T;
}

/**
 * Serialize an EncryptedDataBundle into a compact string representation
 * Format: enc:v1:<algorithm>:<salt>:<iv>:<tag || 'none'>:<ciphertext>[:<aad_hex>]
 */
export function serializeBundle(bundle: EncryptedDataBundle): string {
  const parts = [
    bundle.algorithm,
    bundle.salt,
    bundle.iv,
    bundle.tag || 'none',
    bundle.ciphertext,
  ];

  if (bundle.aad) {
    parts.push(Buffer.from(bundle.aad, 'utf8').toString('hex'));
  }

  return `${ENCRYPTION_SERIALIZATION_PREFIX}${parts.join(':')}`;
}

/**
 * Deserialize a compact string representation back into an EncryptedDataBundle
 */
export function deserializeBundle(serialized: string): EncryptedDataBundle {
  if (!serialized.startsWith(ENCRYPTION_SERIALIZATION_PREFIX)) {
    throw new Error(CRYPTO_ERROR_MESSAGES.INVALID_SERIALIZED_FORMAT);
  }

  const payload = serialized.slice(ENCRYPTION_SERIALIZATION_PREFIX.length);
  const parts = payload.split(':');

  if (parts.length < 5) {
    throw new Error(CRYPTO_ERROR_MESSAGES.INVALID_SERIALIZED_FORMAT);
  }

  const [algorithm, salt, iv, tag, ciphertext, aadHex] = parts;

  return {
    algorithm: algorithm as AESAlgorithm,
    salt,
    iv,
    tag: tag === 'none' ? undefined : tag,
    ciphertext,
    aad: aadHex ? Buffer.from(aadHex, 'hex').toString('utf8') : undefined,
  };
}

/**
 * Field-level encryption for database records or DTOs
 */
export function encryptFields<T extends object>(
  record: T,
  fieldsToEncrypt: (keyof T)[],
  options?: EncryptionOptions
): T {
  const result = { ...record } as Record<keyof T, unknown>;
  for (const field of fieldsToEncrypt) {
    if (result[field] !== undefined && result[field] !== null) {
      const encryptedBundle = encrypt(String(result[field]), options);
      result[field] = serializeBundle(encryptedBundle);
    }
  }
  return result as T;
}

/**
 * Field-level decryption for database records or DTOs
 */
export function decryptFields<T extends object>(
  record: T,
  fieldsToDecrypt: (keyof T)[],
  options?: DecryptionOptions
): T {
  const result = { ...record } as Record<keyof T, unknown>;
  for (const field of fieldsToDecrypt) {
    if (
      typeof result[field] === 'string' &&
      (result[field] as string).startsWith(ENCRYPTION_SERIALIZATION_PREFIX)
    ) {
      result[field] = decrypt(result[field] as string, options);
    }
  }
  return result as T;
}
