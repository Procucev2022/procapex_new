/**
 * AES Cryptographic Constants & Standards
 * ProcureTrack / ProcApex Enterprise Platform
 */

export const DEFAULT_AES_ALGORITHM = 'aes-256-gcm' as const;

export const SUPPORTED_AES_ALGORITHMS = [
  'aes-256-gcm',
  'aes-256-cbc',
] as const;

export const AES_KEY_LENGTH_BYTES = 32; // 256 bits
export const AES_GCM_IV_LENGTH_BYTES = 12; // 96 bits (NIST recommendation for GCM)
export const AES_CBC_IV_LENGTH_BYTES = 16; // 128 bits
export const AES_TAG_LENGTH_BYTES = 16; // 128-bit authentication tag
export const AES_SALT_LENGTH_BYTES = 16; // 128-bit salt for PBKDF2

export const PBKDF2_ITERATIONS = 100000;
export const PBKDF2_DIGEST = 'sha256' as const;

export const ENCRYPTION_SERIALIZATION_PREFIX = 'enc:v1:' as const;

export const DEFAULT_ENCRYPTION_SECRET_FALLBACK =
  'procapex-enterprise-secure-master-key-2026-v1';

export const CRYPTO_ERROR_MESSAGES = {
  UNSUPPORTED_ALGORITHM: 'Unsupported AES algorithm specified.',
  CORRUPTED_CIPHERTEXT: 'Decryption failed: corrupted ciphertext or authentication tag mismatch.',
  INVALID_KEY_LENGTH: 'Encryption key must be exactly 32 bytes (256 bits).',
  INVALID_SERIALIZED_FORMAT: 'Invalid serialized encrypted bundle format.',
  MISSING_AUTH_TAG: 'AES-GCM decryption requires a valid 16-byte authentication tag.',
} as const;
