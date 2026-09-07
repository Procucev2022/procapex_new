/**
 * Unit Tests for Centralized Input Validation Engine (src/lib/validator.ts)
 */

import { validateSchema, validateQueryParams, validateHeaders } from '@/lib/validator';
import { ObjectSchema, HeadersSchema } from '@/types/validation';

describe('Centralized Validator Engine (src/lib/validator.ts)', () => {
  describe('validateSchema - Root and Base Payload Handling', () => {
    const testSchema: ObjectSchema = {
      name: { type: 'string', required: true },
    };

    it('should reject null or non-object payloads', () => {
      const resNull = validateSchema(null, testSchema);
      expect(resNull.isValid).toBe(false);
      expect(resNull.errors[0].field).toBe('root');

      const resUndefined = validateSchema(undefined, testSchema);
      expect(resUndefined.isValid).toBe(false);

      const resArray = validateSchema(['not an object'], testSchema);
      expect(resArray.isValid).toBe(false);

      const resPrimitive = validateSchema('raw string', testSchema);
      expect(resPrimitive.isValid).toBe(false);
    });

    it('should validate valid object payload and return data', () => {
      const res = validateSchema({ name: 'Cement Bag' }, testSchema);
      expect(res.isValid).toBe(true);
      expect(res.data.name).toBe('Cement Bag');
      expect(res.errors).toEqual([]);
      expect(res.errorSummary).toBeUndefined();
    });
  });

  describe('validateSchema - Field Types and Constraints', () => {
    it('should validate string constraints: minLength, maxLength, pattern, and required', () => {
      const schema: ObjectSchema = {
        title: { type: 'string', required: true, minLength: 3, maxLength: 10 },
        code: { type: 'string', pattern: /^PR-\d+$/, patternDescription: 'Must match PR-123 format' },
      };

      // Missing required
      const resMissing = validateSchema({}, schema);
      expect(resMissing.isValid).toBe(false);
      expect(resMissing.errors[0].message).toContain('is required');

      // Empty string for required
      const resEmpty = validateSchema({ title: '   ' }, schema);
      expect(resEmpty.isValid).toBe(false);

      // minLength violation
      const resShort = validateSchema({ title: 'AB' }, schema);
      expect(resShort.isValid).toBe(false);
      expect(resShort.errors[0].message).toContain('at least 3 characters');

      // maxLength violation
      const resLong = validateSchema({ title: 'ABCDEFGHIJKLMN' }, schema);
      expect(resLong.isValid).toBe(false);
      expect(resLong.errors[0].message).toContain('cannot exceed 10 characters');

      // Pattern violation
      const resBadPattern = validateSchema({ title: 'ValidTitle', code: 'INVALID-CODE' }, schema);
      expect(resBadPattern.isValid).toBe(false);
      expect(resBadPattern.errors[0].message).toBe('Must match PR-123 format');

      // Non-string type
      const resNonString = validateSchema({ title: 12345 }, schema, { coerceTypes: false });
      expect(resNonString.isValid).toBe(false);
      expect(resNonString.errors[0].message).toContain('must be a string');

      // Successful string validation
      const resValid = validateSchema({ title: 'GoodTitle', code: 'PR-999' }, schema);
      expect(resValid.isValid).toBe(true);
    });

    it('should validate number constraints: min, max, coercion, and NaN handling', () => {
      const schema: ObjectSchema = {
        quantity: { type: 'number', required: true, min: 1, max: 100, coerce: true },
        rate: { type: 'number', required: false, min: 0 },
      };

      // String coercion to number
      const resCoerced = validateSchema({ quantity: '42' }, schema);
      expect(resCoerced.isValid).toBe(true);
      expect(resCoerced.data.quantity).toBe(42);

      // Min violation
      const resLow = validateSchema({ quantity: 0 }, schema);
      expect(resLow.isValid).toBe(false);
      expect(resLow.errors[0].message).toContain('greater than or equal to 1');

      // Max violation
      const resHigh = validateSchema({ quantity: 150 }, schema);
      expect(resHigh.isValid).toBe(false);
      expect(resHigh.errors[0].message).toContain('cannot exceed 100');

      // Invalid number / NaN
      const resNaN = validateSchema({ quantity: 'not-a-number' }, schema);
      expect(resNaN.isValid).toBe(false);
      expect(resNaN.errors[0].message).toContain('must be a valid number');
    });

    it('should validate boolean constraints and string coercion', () => {
      const schema: ObjectSchema = {
        isActive: { type: 'boolean', required: true, coerce: true },
        flag: { type: 'boolean', required: false },
      };

      const resTrue = validateSchema({ isActive: 'true' }, schema);
      expect(resTrue.isValid).toBe(true);
      expect(resTrue.data.isActive).toBe(true);

      const resFalse = validateSchema({ isActive: '0' }, schema);
      expect(resFalse.isValid).toBe(true);
      expect(resFalse.data.isActive).toBe(false);

      const resInvalid = validateSchema({ isActive: 'maybe' }, schema);
      expect(resInvalid.isValid).toBe(false);
      expect(resInvalid.errors[0].message).toContain('must be a boolean');
    });

    it('should validate enum constraints', () => {
      const schema: ObjectSchema = {
        role: { type: 'enum', enumValues: ['ADMIN', 'BUYER', 'AUDITOR'], required: true },
      };

      const resValid = validateSchema({ role: 'BUYER' }, schema);
      expect(resValid.isValid).toBe(true);

      const resInvalid = validateSchema({ role: 'HACKER' }, schema);
      expect(resInvalid.isValid).toBe(false);
      expect(resInvalid.errors[0].message).toContain('must be one of: [ADMIN, BUYER, AUDITOR]');
    });

    it('should validate array constraints and nested item schemas', () => {
      const schema: ObjectSchema = {
        tags: { type: 'array', minLength: 1, maxLength: 3, arrayItemSchema: { type: 'string', minLength: 2 } },
      };

      // Non-array
      const resNotArray = validateSchema({ tags: 'tag1,tag2' }, schema);
      expect(resNotArray.isValid).toBe(false);
      expect(resNotArray.errors[0].message).toContain('must be an array');

      // Array too short
      const resShort = validateSchema({ tags: [] }, schema);
      expect(resShort.isValid).toBe(false);
      expect(resShort.errors[0].message).toContain('at least 1 items');

      // Array too long
      const resLong = validateSchema({ tags: ['a', 'b', 'c', 'd'] }, schema);
      expect(resLong.isValid).toBe(false);
      expect(resLong.errors[0].message).toContain('cannot contain more than 3 items');

      // Array item validation failure
      const resBadItem = validateSchema({ tags: ['valid', 'x'] }, schema);
      expect(resBadItem.isValid).toBe(false);
      expect(resBadItem.errors[0].message).toContain('at least 2 characters');

      // Valid array
      const resValid = validateSchema({ tags: ['tag1', 'tag2'] }, schema);
      expect(resValid.isValid).toBe(true);
    });

    it('should validate nested object constraints', () => {
      const schema: ObjectSchema = {
        metadata: {
          type: 'object',
          required: true,
          objectSchema: {
            author: { type: 'string', required: true },
            version: { type: 'number', min: 1 },
          },
        },
      };

      // Non-object
      const resNotObject = validateSchema({ metadata: 'string' }, schema);
      expect(resNotObject.isValid).toBe(false);
      expect(resNotObject.errors[0].message).toContain('must be an object');

      // Nested validation failure
      const resNestedFail = validateSchema({ metadata: { version: 0 } }, schema);
      expect(resNestedFail.isValid).toBe(false);
      expect(resNestedFail.errors[0].field).toContain('metadata');

      // Valid nested object
      const resValid = validateSchema({ metadata: { author: 'Vikram', version: 2 } }, schema);
      expect(resValid.isValid).toBe(true);
    });

    it('should validate dates and timestamps', () => {
      const schema: ObjectSchema = {
        createdAt: { type: 'date', required: true },
      };

      const resDateObj = validateSchema({ createdAt: new Date() }, schema);
      expect(resDateObj.isValid).toBe(true);

      const resIsoString = validateSchema({ createdAt: '2026-09-07T12:00:00Z' }, schema);
      expect(resIsoString.isValid).toBe(true);

      const resInvalid = validateSchema({ createdAt: 'not-a-date' }, schema);
      expect(resInvalid.isValid).toBe(false);
      expect(resInvalid.errors[0].message).toContain('must be a valid date');
    });

    it('should support any type and nullable fields', () => {
      const schema: ObjectSchema = {
        payload: { type: 'any', required: false },
        optionalNullable: { type: 'string', required: false, nullable: true },
      };

      const res = validateSchema({ payload: { custom: [1, 2, 3] }, optionalNullable: null }, schema);
      expect(res.isValid).toBe(true);
      expect(res.data.optionalNullable).toBeNull();
    });

    it('should reject null when nullable is false or omitted on non-required field', () => {
      const schema: ObjectSchema = {
        nonNullableField: { type: 'string', required: false, nullable: false },
      };

      const res = validateSchema({ nonNullableField: null }, schema);
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('cannot be null');
    });

    it('should coerce numbers and booleans to string when field type is string', () => {
      const schema: ObjectSchema = {
        label: { type: 'string', coerce: true },
        flagStr: { type: 'string', coerce: true },
      };

      const res = validateSchema({ label: 12345, flagStr: true }, schema);
      expect(res.isValid).toBe(true);
      expect(res.data.label).toBe('12345');
      expect(res.data.flagStr).toBe('true');
    });

    it('should handle whitespace in number coercion and fallback pattern message', () => {
      const schema: ObjectSchema = {
        rate: { type: 'number', required: false, coerce: true },
        code: { type: 'string', pattern: /^\d+$/ },
      };

      const resEmptyNum = validateSchema({ rate: '   ', code: 'abc' }, schema);
      expect(resEmptyNum.isValid).toBe(false);
      expect(resEmptyNum.data.rate).toBeUndefined();
      expect(resEmptyNum.errors.some((e) => e.message.includes('fails format pattern constraint'))).toBe(true);
    });

    it('should handle abortEarly across different validation stages', () => {
      const schema: ObjectSchema = {
        field1: { type: 'string', required: false, nullable: false },
        field2: { type: 'number', required: true },
      };

      const resNullAbort = validateSchema({ field1: null, field2: 'bad' }, schema, { abortEarly: true });
      expect(resNullAbort.isValid).toBe(false);
      expect(resNullAbort.errors.length).toBe(1);

      const typeSchema: ObjectSchema = {
        f1: { type: 'number' },
        f2: { type: 'number' },
      };
      const resTypeAbort = validateSchema({ f1: 'not-num', f2: 'not-num' }, typeSchema, { abortEarly: true, coerceTypes: false });
      expect(resTypeAbort.isValid).toBe(false);
      expect(resTypeAbort.errors.length).toBe(1);

      const customSchema: ObjectSchema = {
        c1: { type: 'string', custom: () => false },
        c2: { type: 'string', custom: () => false },
      };
      const resCustomAbort = validateSchema({ c1: 'val', c2: 'val' }, customSchema, { abortEarly: true });
      expect(resCustomAbort.isValid).toBe(false);
      expect(resCustomAbort.errors.length).toBe(1);
    });
  });

  describe('validateSchema - Options & Custom Validators', () => {
    it('should apply defaults when field is undefined', () => {
      const schema: ObjectSchema = {
        limit: { type: 'number', default: 50 },
        timestamp: { type: 'string', default: () => '2026-01-01' },
      };

      const res = validateSchema({}, schema);
      expect(res.isValid).toBe(true);
      expect(res.data.limit).toBe(50);
      expect(res.data.timestamp).toBe('2026-01-01');
    });

    it('should strip unknown fields when stripUnknown is true', () => {
      const schema: ObjectSchema = {
        name: { type: 'string', required: true },
      };

      const res = validateSchema({ name: 'Valid', secret: '123' }, schema, { stripUnknown: true });
      expect(res.isValid).toBe(true);
      expect(res.data.name).toBe('Valid');
      expect((res.data as any).secret).toBeUndefined();
    });

    it('should stop after first error when abortEarly is true', () => {
      const schema: ObjectSchema = {
        fieldA: { type: 'string', required: true },
        fieldB: { type: 'string', required: true },
      };

      const res = validateSchema({}, schema, { abortEarly: true });
      expect(res.isValid).toBe(false);
      expect(res.errors.length).toBe(1);
    });

    it('should execute custom validation functions correctly', () => {
      const schema: ObjectSchema = {
        discount: {
          type: 'number',
          custom: (val) => val <= 50 || 'Discount cannot exceed 50%',
        },
        evenNumber: {
          type: 'number',
          custom: (val) => val % 2 === 0,
        },
        throwingValidator: {
          type: 'string',
          custom: () => {
            throw new Error('Explosion');
          },
        },
      };

      const resFailString = validateSchema({ discount: 60, evenNumber: 4 }, schema);
      expect(resFailString.isValid).toBe(false);
      expect(resFailString.errors.some((e) => e.message === 'Discount cannot exceed 50%')).toBe(true);

      const resFailBool = validateSchema({ discount: 10, evenNumber: 5 }, schema);
      expect(resFailBool.isValid).toBe(false);
      expect(resFailBool.errors.some((e) => e.message.includes('failed custom validation check'))).toBe(true);

      const resThrow = validateSchema({ throwingValidator: 'test' }, schema);
      expect(resThrow.isValid).toBe(false);
      expect(resThrow.errors.some((e) => e.message.includes('Explosion'))).toBe(true);
    });
  });

  describe('validateQueryParams', () => {
    const querySchema: ObjectSchema = {
      limit: { type: 'number', default: 50 },
      active: { type: 'boolean', default: false },
      search: { type: 'string' },
    };

    it('should parse and coerce URLSearchParams instance', () => {
      const params = new URLSearchParams('limit=25&active=true&search=steel');
      const res = validateQueryParams(params, querySchema);

      expect(res.isValid).toBe(true);
      expect(res.data.limit).toBe(25);
      expect(res.data.active).toBe(true);
      expect(res.data.search).toBe('steel');
    });

    it('should parse query string with leading question mark', () => {
      const res = validateQueryParams('?limit=100&active=1', querySchema);
      expect(res.isValid).toBe(true);
      expect(res.data.limit).toBe(100);
      expect(res.data.active).toBe(true);
    });

    it('should handle plain object with array values', () => {
      const rawObj = { limit: ['20', '30'], active: 'false' };
      const res = validateQueryParams(rawObj, querySchema);
      expect(res.isValid).toBe(true);
      expect(res.data.limit).toBe(20);
      expect(res.data.active).toBe(false);
    });
  });

  describe('validateHeaders', () => {
    const headersSchema: HeadersSchema = {
      headers: [
        { name: 'X-Correlation-Id', required: true, pattern: /^req-[a-z0-9]+$/ },
        { name: 'Content-Type', required: false, allowedValues: ['application/json', 'text/plain'] },
      ],
    };

    it('should validate Headers instance with case-insensitive matching', () => {
      const headers = new Headers();
      headers.set('x-correlation-id', 'req-abc123');
      headers.set('content-type', 'application/json');

      const res = validateHeaders(headers, headersSchema);
      expect(res.isValid).toBe(true);
      expect(res.data['x-correlation-id']).toBe('req-abc123');
    });

    it('should validate plain dictionary headers and flag missing required header', () => {
      const resMissing = validateHeaders({}, headersSchema);
      expect(resMissing.isValid).toBe(false);
      expect(resMissing.errors[0].message).toContain("Header 'X-Correlation-Id' is required");
    });

    it('should reject invalid pattern in header', () => {
      const headers = { 'x-correlation-id': 'INVALID-PATTERN' };
      const res = validateHeaders(headers, headersSchema);
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('format is invalid');
    });

    it('should reject disallowed header values', () => {
      const headers = {
        'x-correlation-id': 'req-1234',
        'content-type': 'application/xml',
      };
      const res = validateHeaders(headers, headersSchema);
      expect(res.isValid).toBe(false);
      expect(res.errors[0].message).toContain('must be one of: application/json, text/plain');
    });
  });
});
