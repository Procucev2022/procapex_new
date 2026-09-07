/**
 * AES Cryptographic Types & Interfaces
 * ProcureTrack / ProcApex Enterprise Platform
 */

export type AESAlgorithm = 'aes-256-gcm' | 'aes-256-cbc';

export interface EncryptedDataBundle {
  algorithm: AESAlgorithm;
  iv: string; // hex-encoded initialization vector
  tag?: string; // hex-encoded 128-bit authentication tag (for GCM)
  salt: string; // hex-encoded 128-bit PBKDF2 salt
  ciphertext: string; // hex-encoded encrypted payload
  aad?: string; // optional hex-encoded additional authenticated data
}

export interface EncryptionOptions {
  algorithm?: AESAlgorithm;
  masterKey?: string;
  salt?: Buffer | string;
  aad?: string;
  encoding?: BufferEncoding;
}

export interface DecryptionOptions {
  masterKey?: string;
  aad?: string;
  encoding?: BufferEncoding;
}

export interface FieldEncryptionConfig<T> {
  fields: (keyof T)[];
  algorithm?: AESAlgorithm;
  masterKey?: string;
}

export interface CryptoAuditEntry {
  operation: 'ENCRYPT' | 'DECRYPT' | 'BLIND_INDEX';
  algorithm: string;
  durationMs: number;
  bytesProcessed: number;
  success: boolean;
}
