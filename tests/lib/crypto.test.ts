import {
  encrypt,
  decrypt,
  decryptJson,
  serializeBundle,
  deserializeBundle,
  encryptFields,
  decryptFields,
  generateBlindIndex,
  generateRandomKey,
  deriveKey,
  getMasterSecret,
} from '@/lib/crypto';
import {
  DEFAULT_AES_ALGORITHM,
  SUPPORTED_AES_ALGORITHMS,
  AES_KEY_LENGTH_BYTES,
  AES_GCM_IV_LENGTH_BYTES,
  AES_CBC_IV_LENGTH_BYTES,
  AES_TAG_LENGTH_BYTES,
  AES_SALT_LENGTH_BYTES,
  DEFAULT_ENCRYPTION_SECRET_FALLBACK,
  CRYPTO_ERROR_MESSAGES,
} from '@/constants';
import { EncryptedDataBundle } from '@/types';
import crypto from 'node:crypto';

describe('AES Cryptographic Suite (src/lib/crypto.ts)', () => {
  const samplePlaintext = 'Confidential Vendor Bank Account: IBAN-IN-9876543210';
  const samplePayload = {
    vendorId: 'VND-001',
    financials: {
      accountNumber: '9876543210',
      bankName: 'HDFC Bank',
      swiftCode: 'HDFCINBB',
    },
    negotiationCeiling: 450000,
  };

  describe('Core AES-256-GCM Authenticated Encryption & Decryption', () => {
    it('should encrypt and decrypt plaintext successfully using default AES-256-GCM', () => {
      const bundle = encrypt(samplePlaintext);

      expect(bundle.algorithm).toBe(DEFAULT_AES_ALGORITHM);
      expect(bundle.iv).toHaveLength(AES_GCM_IV_LENGTH_BYTES * 2);
      expect(bundle.salt).toHaveLength(AES_SALT_LENGTH_BYTES * 2);
      expect(bundle.tag).toHaveLength(AES_TAG_LENGTH_BYTES * 2);
      expect(bundle.ciphertext).toBeDefined();

      const decrypted = decrypt(bundle);
      expect(decrypted).toBe(samplePlaintext);
    });

    it('should encrypt and decrypt using serialized string format (enc:v1:...)', () => {
      const bundle = encrypt(samplePlaintext);
      const serialized = serializeBundle(bundle);

      expect(serialized).toMatch(/^enc:v1:aes-256-gcm:/);

      const decrypted = decrypt(serialized);
      expect(decrypted).toBe(samplePlaintext);
    });

    it('should support Additional Authenticated Data (AAD) binding', () => {
      const aadContext = 'tenant:TNT_LNT:ppo:PPO-2026-0005';
      const bundle = encrypt(samplePlaintext, { aad: aadContext });
      expect(bundle.aad).toBe(aadContext);

      // Decryption with matching AAD succeeds
      const decrypted = decrypt(bundle, { aad: aadContext });
      expect(decrypted).toBe(samplePlaintext);

      // Decryption with mismatched AAD fails (tamper detection)
      expect(() => {
        decrypt(bundle, { aad: 'tenant:WRONG_TENANT:ppo:PPO-2026-0005' });
      }).toThrow(CRYPTO_ERROR_MESSAGES.CORRUPTED_CIPHERTEXT);
    });

    it('should detect tampering when ciphertext is modified', () => {
      const bundle = encrypt(samplePlaintext);
      const corruptedBundle: EncryptedDataBundle = {
        ...bundle,
        ciphertext:
          bundle.ciphertext.slice(0, -4) +
          (bundle.ciphertext.slice(-4) === '0000' ? 'ffff' : '0000'),
      };

      expect(() => {
        decrypt(corruptedBundle);
      }).toThrow(CRYPTO_ERROR_MESSAGES.CORRUPTED_CIPHERTEXT);
    });

    it('should detect tampering when authentication tag is modified', () => {
      const bundle = encrypt(samplePlaintext);
      const corruptedBundle: EncryptedDataBundle = {
        ...bundle,
        tag:
          bundle.tag!.slice(0, -4) +
          (bundle.tag!.slice(-4) === 'aaaa' ? 'bbbb' : 'aaaa'),
      };

      expect(() => {
        decrypt(corruptedBundle);
      }).toThrow(CRYPTO_ERROR_MESSAGES.CORRUPTED_CIPHERTEXT);
    });

    it('should throw when authentication tag is missing in AES-GCM mode', () => {
      const bundle = encrypt(samplePlaintext);
      const bundleWithoutTag: EncryptedDataBundle = {
        ...bundle,
        tag: undefined,
      };

      expect(() => {
        decrypt(bundleWithoutTag);
      }).toThrow(CRYPTO_ERROR_MESSAGES.MISSING_AUTH_TAG);
    });

    it('should fail decryption when wrong master key is used', () => {
      const bundle = encrypt(samplePlaintext, { masterKey: 'secret-key-alpha-12345' });

      expect(() => {
        decrypt(bundle, { masterKey: 'secret-key-beta-67890' });
      }).toThrow(CRYPTO_ERROR_MESSAGES.CORRUPTED_CIPHERTEXT);
    });
  });

  describe('AES-256-CBC Encryption & Decryption', () => {
    it('should encrypt and decrypt successfully using AES-256-CBC', () => {
      const bundle = encrypt(samplePlaintext, { algorithm: 'aes-256-cbc' });

      expect(bundle.algorithm).toBe('aes-256-cbc');
      expect(bundle.iv).toHaveLength(AES_CBC_IV_LENGTH_BYTES * 2);
      expect(bundle.salt).toHaveLength(AES_SALT_LENGTH_BYTES * 2);
      expect(bundle.tag).toBeUndefined();

      const decrypted = decrypt(bundle);
      expect(decrypted).toBe(samplePlaintext);
    });

    it('should fail decryption on corrupted CBC ciphertext', () => {
      const bundle = encrypt(samplePlaintext, { algorithm: 'aes-256-cbc' });
      const corruptedBundle: EncryptedDataBundle = {
        ...bundle,
        ciphertext: bundle.ciphertext.slice(0, -2) + '00',
      };

      expect(() => {
        decrypt(corruptedBundle);
      }).toThrow(CRYPTO_ERROR_MESSAGES.CORRUPTED_CIPHERTEXT);
    });
  });

  describe('Algorithm Validation & Error Cases', () => {
    it('should throw when unsupported algorithm is passed to encrypt()', () => {
      expect(() => {
        encrypt(samplePlaintext, { algorithm: 'aes-128-ecb' as any });
      }).toThrow(CRYPTO_ERROR_MESSAGES.UNSUPPORTED_ALGORITHM);
    });

    it('should throw when unsupported algorithm is passed to decrypt()', () => {
      const invalidBundle: EncryptedDataBundle = {
        algorithm: 'aes-128-ecb' as any,
        iv: '00'.repeat(16),
        salt: '00'.repeat(16),
        ciphertext: '00'.repeat(32),
      };

      expect(() => {
        decrypt(invalidBundle);
      }).toThrow(CRYPTO_ERROR_MESSAGES.UNSUPPORTED_ALGORITHM);
    });
  });

  describe('JSON Object Encryption & Decryption', () => {
    it('should encrypt an object and decrypt it using decryptJson()', () => {
      const bundle = encrypt(samplePayload);
      const parsed = decryptJson<typeof samplePayload>(bundle);

      expect(parsed).toEqual(samplePayload);
      expect(parsed.financials.accountNumber).toBe('9876543210');
    });

    it('should decrypt a serialized bundle string using decryptJson()', () => {
      const bundle = encrypt(samplePayload);
      const serialized = serializeBundle(bundle);
      const parsed = decryptJson<typeof samplePayload>(serialized);

      expect(parsed).toEqual(samplePayload);
    });
  });

  describe('Serialization & Deserialization Utilities', () => {
    it('should serialize and deserialize an encrypted bundle with AAD', () => {
      const bundle = encrypt(samplePlaintext, { aad: 'ctx-001' });
      const serialized = serializeBundle(bundle);
      const deserialized = deserializeBundle(serialized);

      expect(deserialized.algorithm).toBe(bundle.algorithm);
      expect(deserialized.salt).toBe(bundle.salt);
      expect(deserialized.iv).toBe(bundle.iv);
      expect(deserialized.tag).toBe(bundle.tag);
      expect(deserialized.ciphertext).toBe(bundle.ciphertext);
      expect(deserialized.aad).toBe('ctx-001');
    });

    it('should serialize and deserialize a bundle without tag (CBC mode)', () => {
      const bundle = encrypt(samplePlaintext, { algorithm: 'aes-256-cbc' });
      const serialized = serializeBundle(bundle);
      const deserialized = deserializeBundle(serialized);

      expect(deserialized.algorithm).toBe('aes-256-cbc');
      expect(deserialized.tag).toBeUndefined();
    });

    it('should reject invalid serialization prefix', () => {
      expect(() => {
        deserializeBundle('invalid:prefix:123');
      }).toThrow(CRYPTO_ERROR_MESSAGES.INVALID_SERIALIZED_FORMAT);
    });

    it('should reject malformed serialized bundle with insufficient segments', () => {
      expect(() => {
        deserializeBundle('enc:v1:aes-256-gcm:salt:iv');
      }).toThrow(CRYPTO_ERROR_MESSAGES.INVALID_SERIALIZED_FORMAT);
    });
  });

  describe('Field-Level Encryption & Decryption', () => {
    interface VendorFinancialRecord {
      id: string;
      name: string;
      bankAccount: string;
      taxId: string;
      notes?: string;
    }

    const record: VendorFinancialRecord = {
      id: 'VND-001',
      name: 'DesignCraft Millworks',
      bankAccount: '987654321098',
      taxId: '27AABCV1234F1Z5',
      notes: 'Standard Net 30 terms',
    };

    it('should encrypt only specified sensitive fields', () => {
      const encrypted = encryptFields(record, ['bankAccount', 'taxId']);

      expect(encrypted.id).toBe('VND-001');
      expect(encrypted.name).toBe('DesignCraft Millworks');
      expect(encrypted.notes).toBe('Standard Net 30 terms');

      expect(encrypted.bankAccount).toMatch(/^enc:v1:aes-256-gcm:/);
      expect(encrypted.taxId).toMatch(/^enc:v1:aes-256-gcm:/);
    });

    it('should decrypt encrypted fields back to original values', () => {
      const encrypted = encryptFields(record, ['bankAccount', 'taxId']);
      const decrypted = decryptFields(encrypted, ['bankAccount', 'taxId']);

      expect(decrypted).toEqual(record);
      expect(decrypted.bankAccount).toBe('987654321098');
      expect(decrypted.taxId).toBe('27AABCV1234F1Z5');
    });

    it('should safely ignore null, undefined, or unencrypted fields during field encryption/decryption', () => {
      const partialRecord: any = {
        id: 'VND-002',
        bankAccount: null,
        taxId: undefined,
        notes: 'Already plaintext',
      };

      const encrypted = encryptFields(partialRecord, ['bankAccount', 'taxId']);
      expect(encrypted.bankAccount).toBeNull();
      expect(encrypted.taxId).toBeUndefined();

      const decrypted = decryptFields(encrypted, ['bankAccount', 'notes']);
      expect(decrypted.notes).toBe('Already plaintext');
    });
  });

  describe('Blind Indexing & Deterministic Hashing', () => {
    it('should generate deterministic HMAC-SHA256 blind index for searchable encryption', () => {
      const index1 = generateBlindIndex('vendor@example.com');
      const index2 = generateBlindIndex('vendor@example.com');
      const index3 = generateBlindIndex('different@example.com');

      expect(index1).toBe(index2);
      expect(index1).not.toBe(index3);
      expect(index1).toHaveLength(64); // 256 bits hex
    });

    it('should produce different blind index when custom secret is used', () => {
      const indexDefault = generateBlindIndex('test-value');
      const indexCustom = generateBlindIndex('test-value', 'custom-blind-secret');

      expect(indexDefault).not.toBe(indexCustom);
    });
  });

  describe('Key Derivation, Key Generation & Master Secrets', () => {
    it('should derive consistent 32-byte key from secret and salt', () => {
      const salt = crypto.randomBytes(16);
      const key1 = deriveKey('my-secret-passphrase', salt);
      const key2 = deriveKey('my-secret-passphrase', salt);

      expect(key1).toHaveLength(AES_KEY_LENGTH_BYTES);
      expect(key1.equals(key2)).toBe(true);
    });

    it('should generate cryptographically random keys formatted as hex', () => {
      const key = generateRandomKey();
      expect(key).toHaveLength(AES_KEY_LENGTH_BYTES * 2);

      const customKey = generateRandomKey(16);
      expect(customKey).toHaveLength(32);
    });

    it('should accept custom salt as string in encryption options', () => {
      const customSaltHex = crypto.randomBytes(16).toString('hex');
      const bundle = encrypt(samplePlaintext, { salt: customSaltHex });

      expect(bundle.salt).toBe(customSaltHex);
      expect(decrypt(bundle)).toBe(samplePlaintext);
    });

    it('should accept custom salt as Buffer in encryption options', () => {
      const customSaltBuffer = crypto.randomBytes(16);
      const bundle = encrypt(samplePlaintext, { salt: customSaltBuffer });

      expect(bundle.salt).toBe(customSaltBuffer.toString('hex'));
      expect(decrypt(bundle)).toBe(samplePlaintext);
    });

    it('should retrieve master secret prioritizing parameter, env, then fallback', () => {
      expect(getMasterSecret('explicit-key')).toBe('explicit-key');

      const origEnv = process.env.ENCRYPTION_SECRET;
      process.env.ENCRYPTION_SECRET = 'env-key-999';
      expect(getMasterSecret()).toBe('env-key-999');

      delete process.env.ENCRYPTION_SECRET;
      expect(getMasterSecret()).toBe(DEFAULT_ENCRYPTION_SECRET_FALLBACK);

      if (origEnv) {
        process.env.ENCRYPTION_SECRET = origEnv;
      }
    });
  });
});
