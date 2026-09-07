/**
 * Centralized Input Validation Schemas & Rules
 * ProcureTrack / ProcApex Enterprise Platform
 *
 * All validation schemas across frontend forms, API route payloads,
 * controller arguments, query parameters, and headers are defined here.
 */

import { ObjectSchema, HeadersSchema } from '@/types/validation';

// ==============================================================================
// 1. API Route Input Validation Schemas
// ==============================================================================

export const API_COST_ANALYSIS_SCHEMA: ObjectSchema = {
  itemDescription: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 500,
    description: 'Description of the item or procurement material',
  },
  quantity: {
    type: 'number',
    required: false,
    min: 0.0001,
    max: 100000000,
    default: 1,
    coerce: true,
    description: 'Required quantity for estimation',
  },
  uom: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 50,
    default: 'Unit',
    description: 'Unit of measure (e.g. MT, Sq.Ft, Nos)',
  },
  currentQuote: {
    type: 'number',
    required: false,
    min: 0,
    coerce: true,
    description: 'Current vendor quoted rate in INR',
  },
};

export const API_NEGOTIATION_SCHEMA: ObjectSchema = {
  prTitle: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 200,
    description: 'Purchase request title for context',
  },
  itemName: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 200,
    description: 'Item name undergoing negotiation',
  },
  vendorQuoteRate: {
    type: 'number',
    required: false,
    min: 0,
    default: 0,
    coerce: true,
    description: 'Latest vendor quoted rate',
  },
  targetBenchmark: {
    type: 'number',
    required: false,
    min: 0,
    default: 0,
    coerce: true,
    description: 'MLEO / internal cost benchmark rate',
  },
  currentRound: {
    type: 'number',
    required: false,
    min: 1,
    max: 20,
    default: 1,
    coerce: true,
    description: 'Current counter-offer negotiation round',
  },
  historySummary: {
    type: 'string',
    required: false,
    maxLength: 2000,
    description: 'Brief history summary of prior discussions',
  },
};

export const API_AI_STATUS_QUERY_SCHEMA: ObjectSchema = {
  model: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Requested AI model check',
  },
  checkLive: {
    type: 'boolean',
    required: false,
    coerce: true,
    description: 'Flag to test live connection to Gemini',
  },
};

export const API_GRAPHQL_SCHEMA: ObjectSchema = {
  query: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 20000,
    description: 'GraphQL query or mutation document string',
  },
  operationName: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Optional named operation to execute',
  },
  variables: {
    type: 'object',
    required: false,
    description: 'Optional GraphQL variables dictionary',
  },
};

export const API_LOGS_QUERY_SCHEMA: ObjectSchema = {
  action: {
    type: 'enum',
    required: false,
    enumValues: ['diagnose', 'auto-resolve', 'purge'],
    description: 'Special diagnostic action to trigger',
  },
  level: {
    type: 'enum',
    required: false,
    enumValues: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    description: 'Severity level filter',
  },
  module: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Module prefix filter',
  },
  search: {
    type: 'string',
    required: false,
    maxLength: 200,
    description: 'Search string inside log messages',
  },
  startDate: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'ISO timestamp start boundary',
  },
  endDate: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'ISO timestamp end boundary',
  },
  correlationId: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Trace correlation identifier filter',
  },
  limit: {
    type: 'number',
    required: false,
    min: 1,
    max: 500,
    default: 50,
    coerce: true,
    description: 'Maximum log entries to return',
  },
  offset: {
    type: 'number',
    required: false,
    min: 0,
    default: 0,
    coerce: true,
    description: 'Pagination offset',
  },
  retentionDays: {
    type: 'number',
    required: false,
    min: 1,
    max: 365,
    default: 7,
    coerce: true,
    description: 'Days of log retention for purge operations',
  },
};

export const API_LOGS_INGEST_SCHEMA: ObjectSchema = {
  level: {
    type: 'enum',
    required: false,
    enumValues: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    default: 'INFO',
    description: 'Log severity level',
  },
  module: {
    type: 'string',
    required: false,
    maxLength: 100,
    default: 'client',
    description: 'Originating client module name',
  },
  message: {
    type: 'string',
    required: false,
    maxLength: 10000,
    default: '',
    description: 'Log message content',
  },
  data: {
    type: 'any',
    required: false,
    description: 'Structured metadata payload',
  },
  correlationId: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Optional correlation ID',
  },
};

export const API_COMMON_HEADERS_SCHEMA: HeadersSchema = {
  headers: [
    {
      name: 'x-correlation-id',
      required: false,
      pattern: /^[a-zA-Z0-9_\-\.]{3,100}$/,
      description: 'Distributed tracing correlation identifier',
    },
    {
      name: 'content-type',
      required: false,
      description: 'Request content-type header',
    },
  ],
};

// ==============================================================================
// 2. Frontend Forms & Domain Input Validation Schemas
// ==============================================================================

export const PURCHASE_REQUEST_FORM_SCHEMA: ObjectSchema = {
  title: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 200,
    description: 'Purchase request title',
  },
  projectName: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Project name',
  },
  projectSite: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Construction site or delivery facility',
  },
  category: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Procurement category code or name',
  },
  costCentre: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    description: 'Financial cost centre code',
  },
  requester: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Person or department submitting PR',
  },
  requiredBy: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'Target delivery date',
  },
  budget: {
    type: 'number',
    required: false,
    min: 0,
    coerce: true,
    description: 'Approved budget amount in INR',
  },
  notes: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Optional requisition notes',
  },
  items: {
    type: 'array',
    required: true,
    minLength: 1,
    description: 'Requisition line items array',
  },
};

export const BOQ_ITEM_FORM_SCHEMA: ObjectSchema = {
  itemCode: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'BOQ catalog item code',
  },
  code: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'Short code identifier',
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'Line item description',
  },
  desc: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'Short description',
  },
  spec: {
    type: 'string',
    required: false,
    maxLength: 1000,
    description: 'Technical specifications',
  },
  quantity: {
    type: 'number',
    required: false,
    min: 0.0001,
    coerce: true,
    description: 'Required quantity',
  },
  qty: {
    type: 'number',
    required: false,
    min: 0.0001,
    coerce: true,
    description: 'Short quantity representation',
  },
  uom: {
    type: 'string',
    required: false,
    maxLength: 50,
    description: 'Unit of measurement',
  },
  targetRate: {
    type: 'number',
    required: false,
    min: 0,
    coerce: true,
    description: 'Internal benchmark target unit rate in INR',
  },
  category: {
    type: 'string',
    required: false,
    maxLength: 100,
    description: 'Item material category',
  },
};

export const VENDOR_QUOTE_FORM_SCHEMA: ObjectSchema = {
  unitRate: {
    type: 'number',
    required: true,
    min: 0.01,
    coerce: true,
    description: 'Quoted unit price',
  },
  leadTimeDays: {
    type: 'number',
    required: false,
    min: 1,
    max: 365,
    coerce: true,
    description: 'Estimated delivery lead time in days',
  },
  paymentTerms: {
    type: 'string',
    required: false,
    minLength: 2,
    maxLength: 100,
    description: 'Payment terms agreed (e.g., Net 30 Days)',
  },
  validityDays: {
    type: 'number',
    required: false,
    min: 1,
    max: 180,
    coerce: true,
    description: 'Quote validity window in days',
  },
};

export const PPO_CREATE_FORM_SCHEMA: ObjectSchema = {
  prId: {
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 50,
    description: 'Associated Purchase Request identifier',
  },
  vendor: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Selected vendor commercial partner',
  },
  grandTotal: {
    type: 'number',
    required: true,
    min: 0,
    coerce: true,
    description: 'Grand total commercial value in INR',
  },
  itemDesc: {
    type: 'string',
    required: false,
    maxLength: 500,
    description: 'Main item description for PPO',
  },
  unitRate: {
    type: 'number',
    required: false,
    min: 0,
    coerce: true,
    description: 'Unit rate',
  },
  qty: {
    type: 'number',
    required: false,
    min: 0,
    coerce: true,
    description: 'Quantity',
  },
  items: {
    type: 'array',
    required: false,
    description: 'Selected line items',
  },
  paymentTerms: {
    type: 'string',
    required: false,
    maxLength: 200,
    description: 'Payment milestone terms',
  },
};

export const NEGOTIATION_ROUND_FORM_SCHEMA: ObjectSchema = {
  rate: {
    type: 'number',
    required: true,
    min: 0.01,
    coerce: true,
    description: 'Proposed counter unit rate in INR',
  },
  remarks: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 500,
    description: 'Counter offer rationale or remarks',
  },
  actionType: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 50,
    description: 'Action classification (BUYER_COUNTER, VENDOR_CONCESSION, etc.)',
  },
};
