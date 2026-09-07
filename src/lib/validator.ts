/**
 * Centralized Input Validation Engine
 * ProcureTrack / ProcApex Enterprise Platform
 *
 * Provides schema validation, query parameter coercion, HTTP header validation,
 * and structured error reporting with zero external dependencies.
 */

import {
  ObjectSchema,
  ValidationRule,
  ValidationError,
  ValidationResult,
  ValidationOptions,
  HeadersSchema,
} from '@/types/validation';
import { logger } from '@/lib/logger';

const DEFAULT_OPTIONS: ValidationOptions = {
  stripUnknown: false,
  abortEarly: false,
  coerceTypes: false,
  allowExtraFields: true,
};

/**
 * Validates any structured JavaScript object or payload against an ObjectSchema
 */
export function validateSchema<T = any>(
  data: any,
  schema: ObjectSchema,
  options?: ValidationOptions
): ValidationResult<T> {
  const opts: ValidationOptions = { ...DEFAULT_OPTIONS, ...options };
  const errors: ValidationError[] = [];

  if (data === null || data === undefined || typeof data !== 'object' || Array.isArray(data)) {
    const err: ValidationError = {
      path: '',
      field: 'root',
      message: 'Expected a valid JSON object payload',
      received: typeof data,
      expected: 'object',
    };
    return {
      isValid: false,
      data: {} as T,
      errors: [err],
      errorSummary: 'root: Expected a valid JSON object payload',
    };
  }

  const resultData: Record<string, any> = opts.stripUnknown ? {} : { ...data };

  // Validate all defined fields in schema
  for (const field of Object.keys(schema)) {
    const rule: ValidationRule = schema[field];
    let val = data[field];

    // Apply default if undefined
    if (val === undefined && rule.default !== undefined) {
      val = typeof rule.default === 'function' ? rule.default() : rule.default;
      resultData[field] = val;
    }

    // Coerce types if enabled
    if (val !== undefined && val !== null && (rule.coerce || opts.coerceTypes)) {
      val = coerceFieldValue(val, rule.type);
      resultData[field] = val;
    }

    // Check required constraint
    if (val === undefined || val === null || (rule.type === 'string' && typeof val === 'string' && val.trim() === '')) {
      if (rule.required) {
        errors.push({
          path: field,
          field,
          message: `${field} is required and cannot be empty`,
          received: val,
          expected: rule.type,
        });
        if (opts.abortEarly) break;
        continue;
      }

      if (val === null && !rule.nullable) {
        errors.push({
          path: field,
          field,
          message: `${field} cannot be null`,
          received: null,
          expected: rule.type,
        });
        if (opts.abortEarly) break;
        continue;
      }

      // Not required and empty/null/undefined -> skip remaining checks for this field
      if (val === undefined || (val === null && rule.nullable)) {
        if (opts.stripUnknown && val !== undefined) {
          resultData[field] = val;
        }
        continue;
      }
    }

    // Type validation
    const typeError = validateFieldType(field, val, rule);
    if (typeError) {
      errors.push(typeError);
      if (opts.abortEarly) break;
      continue;
    }

    // Custom validation callback
    if (rule.custom) {
      try {
        const customRes = rule.custom(val, data);
        if (customRes === false) {
          errors.push({
            path: field,
            field,
            message: `${field} failed custom validation check`,
            received: val,
          });
          if (opts.abortEarly) break;
        } else if (typeof customRes === 'string') {
          errors.push({
            path: field,
            field,
            message: customRes,
            received: val,
          });
          if (opts.abortEarly) break;
        }
      } catch (err: any) {
        errors.push({
          path: field,
          field,
          message: `${field} validation threw: ${err?.message || 'Error'}`,
          received: val,
        });
        if (opts.abortEarly) break;
      }
    }

    if (opts.stripUnknown) {
      resultData[field] = val;
    }
  }

  const isValid = errors.length === 0;
  const errorSummary = isValid
    ? undefined
    : errors.map((e) => `${e.field}: ${e.message}`).join(', ');

  if (!isValid) {
    logger.debug('lib/validator', 'Schema validation rejected payload', {
      errorCount: errors.length,
      errors,
    });
  }

  return {
    isValid,
    data: resultData as T,
    errors,
    errorSummary,
  };
}

/**
 * Validates and coerces URL query parameters
 */
export function validateQueryParams<T = any>(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined> | string,
  schema: ObjectSchema,
  options?: ValidationOptions
): ValidationResult<T> {
  const rawParams: Record<string, any> = {};

  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((val, key) => {
      rawParams[key] = val;
    });
  } else if (typeof searchParams === 'string') {
    const usp = new URLSearchParams(searchParams.startsWith('?') ? searchParams.slice(1) : searchParams);
    usp.forEach((val, key) => {
      rawParams[key] = val;
    });
  } else if (searchParams && typeof searchParams === 'object') {
    for (const key of Object.keys(searchParams)) {
      const v = searchParams[key];
      rawParams[key] = Array.isArray(v) ? v[0] : v;
    }
  }

  return validateSchema<T>(rawParams, schema, { ...options, coerceTypes: true });
}

/**
 * Validates incoming HTTP headers against a HeadersSchema
 */
export function validateHeaders(
  headers: Headers | Record<string, string | undefined> | any,
  schema: HeadersSchema
): ValidationResult<Record<string, string>> {
  const errors: ValidationError[] = [];
  const normalizedHeaders: Record<string, string> = {};

  // Extract and normalize headers to lowercase
  if (headers && typeof headers.get === 'function') {
    for (const rule of schema.headers) {
      const lower = rule.name.toLowerCase();
      const val = headers.get(lower) || headers.get(rule.name);
      if (val) normalizedHeaders[lower] = val;
    }
  } else if (headers && typeof headers === 'object') {
    for (const key of Object.keys(headers)) {
      const val = headers[key];
      if (typeof val === 'string') {
        normalizedHeaders[key.toLowerCase()] = val;
      }
    }
  }

  for (const rule of schema.headers) {
    const lowerName = rule.name.toLowerCase();
    const val = normalizedHeaders[lowerName];

    if (!val) {
      if (rule.required) {
        errors.push({
          path: lowerName,
          field: rule.name,
          message: `Header '${rule.name}' is required`,
          expected: 'present',
        });
      }
      continue;
    }

    if (rule.pattern) {
      const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
      if (!regex.test(val)) {
        errors.push({
          path: lowerName,
          field: rule.name,
          message: `Header '${rule.name}' format is invalid`,
          received: val,
        });
      }
    }

    if (rule.allowedValues && !rule.allowedValues.includes(val)) {
      errors.push({
        path: lowerName,
        field: rule.name,
        message: `Header '${rule.name}' value must be one of: ${rule.allowedValues.join(', ')}`,
        received: val,
      });
    }
  }

  const isValid = errors.length === 0;
  return {
    isValid,
    data: normalizedHeaders,
    errors,
    errorSummary: isValid ? undefined : errors.map((e) => e.message).join(', '),
  };
}

/**
 * Internal type validator for a single field
 */
function validateFieldType(field: string, val: any, rule: ValidationRule): ValidationError | null {
  switch (rule.type) {
    case 'string': {
      if (typeof val !== 'string') {
        return {
          path: field,
          field,
          message: `${field} must be a string`,
          received: typeof val,
          expected: 'string',
        };
      }
      if (rule.minLength !== undefined && val.length < rule.minLength) {
        return {
          path: field,
          field,
          message: `${field} length must be at least ${rule.minLength} characters (current: ${val.length})`,
          received: val.length,
        };
      }
      if (rule.maxLength !== undefined && val.length > rule.maxLength) {
        return {
          path: field,
          field,
          message: `${field} length cannot exceed ${rule.maxLength} characters (current: ${val.length})`,
          received: val.length,
        };
      }
      if (rule.pattern) {
        const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
        if (!regex.test(val)) {
          return {
            path: field,
            field,
            message: rule.patternDescription || `${field} fails format pattern constraint`,
            received: val,
          };
        }
      }
      return null;
    }

    case 'number': {
      if (typeof val !== 'number' || isNaN(val)) {
        return {
          path: field,
          field,
          message: `${field} must be a valid number`,
          received: val,
          expected: 'number',
        };
      }
      if (rule.min !== undefined && val < rule.min) {
        return {
          path: field,
          field,
          message: `${field} must be greater than or equal to ${rule.min} (current: ${val})`,
          received: val,
        };
      }
      if (rule.max !== undefined && val > rule.max) {
        return {
          path: field,
          field,
          message: `${field} cannot exceed ${rule.max} (current: ${val})`,
          received: val,
        };
      }
      return null;
    }

    case 'boolean': {
      if (typeof val !== 'boolean') {
        return {
          path: field,
          field,
          message: `${field} must be a boolean (true/false)`,
          received: typeof val,
          expected: 'boolean',
        };
      }
      return null;
    }

    case 'enum': {
      if (!rule.enumValues || !rule.enumValues.includes(val)) {
        return {
          path: field,
          field,
          message: `${field} must be one of: [${(rule.enumValues || []).join(', ')}]`,
          received: val,
          expected: 'enum',
        };
      }
      return null;
    }

    case 'array': {
      if (!Array.isArray(val)) {
        return {
          path: field,
          field,
          message: `${field} must be an array`,
          received: typeof val,
          expected: 'array',
        };
      }
      if (rule.minLength !== undefined && val.length < rule.minLength) {
        return {
          path: field,
          field,
          message: `${field} must contain at least ${rule.minLength} items (current: ${val.length})`,
          received: val.length,
        };
      }
      if (rule.maxLength !== undefined && val.length > rule.maxLength) {
        return {
          path: field,
          field,
          message: `${field} cannot contain more than ${rule.maxLength} items (current: ${val.length})`,
          received: val.length,
        };
      }
      if (rule.arrayItemSchema) {
        for (let i = 0; i < val.length; i++) {
          const itemErr = validateFieldType(`${field}[${i}]`, val[i], rule.arrayItemSchema);
          if (itemErr) return itemErr;
        }
      }
      return null;
    }

    case 'object': {
      if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        return {
          path: field,
          field,
          message: `${field} must be an object`,
          received: typeof val,
          expected: 'object',
        };
      }
      if (rule.objectSchema) {
        const nestedRes = validateSchema(val, rule.objectSchema);
        if (!nestedRes.isValid && nestedRes.errors.length > 0) {
          const firstErr = nestedRes.errors[0];
          return {
            path: `${field}.${firstErr.field}`,
            field: `${field}.${firstErr.field}`,
            message: firstErr.message,
            received: firstErr.received,
          };
        }
      }
      return null;
    }

    case 'date': {
      const isDateInstance = val instanceof Date && !isNaN(val.getTime());
      const isDateString = typeof val === 'string' && !isNaN(Date.parse(val));
      if (!isDateInstance && !isDateString) {
        return {
          path: field,
          field,
          message: `${field} must be a valid date or ISO timestamp`,
          received: val,
          expected: 'date',
        };
      }
      return null;
    }

    case 'any':
    default:
      return null;
  }
}

/**
 * Coerces primitive values from string/number inputs when appropriate
 */
function coerceFieldValue(val: any, type: string): any {
  if (val === undefined || val === null) return val;

  if (type === 'number') {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (trimmed === '') return undefined;
      const parsed = Number(trimmed);
      return isNaN(parsed) ? val : parsed;
    }
  }

  if (type === 'boolean') {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
  }

  if (type === 'string') {
    if (typeof val !== 'string' && (typeof val === 'number' || typeof val === 'boolean')) {
      return String(val);
    }
  }

  return val;
}
