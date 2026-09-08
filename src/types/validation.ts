/**
 * Input Schema Validation Types & Interfaces
 * ProcureTrack / ProcApex Enterprise Platform
 */

export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'date'
  | 'enum'
  | 'any';

export interface ValidationError {
  path: string;
  field: string;
  message: string;
  received?: unknown;
  expected?: string;
}

export interface ValidationRule<T = unknown> {
  type: FieldType;
  required?: boolean;
  nullable?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp | string;
  patternDescription?: string;
  enumValues?: readonly (string | number)[] | (string | number)[];
  arrayItemSchema?: ValidationRule;
  objectSchema?: ObjectSchema;
  custom?: (value: T, context?: unknown) => boolean | string;
  description?: string;
  default?: unknown;
  coerce?: boolean;
}

export type ObjectSchema = Record<string, ValidationRule>;

export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data: T;
  errors: ValidationError[];
  errorSummary?: string;
}

export interface ValidationOptions {
  stripUnknown?: boolean;
  abortEarly?: boolean;
  coerceTypes?: boolean;
  allowExtraFields?: boolean;
}

export interface HeaderValidationRule {
  name: string;
  required?: boolean;
  pattern?: RegExp | string;
  allowedValues?: readonly string[] | string[];
  description?: string;
}

export interface HeadersSchema {
  headers: HeaderValidationRule[];
}
