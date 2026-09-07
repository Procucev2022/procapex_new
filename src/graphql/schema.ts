import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type TenantUser {
    name: String!
    title: String!
  }

  type Tenant {
    id: String!
    key: String!
    name: String!
    short: String!
    project: String!
    vendor: String
    users: [TenantUserRecord!]
  }

  type TenantUserRecord {
    role: String!
    name: String!
    title: String!
  }

  type MLEOBreakdown {
    m: Float!
    l: Float!
    e: Float!
    o: Float!
    conf: String
  }

  type BOQItem {
    code: String!
    desc: String!
    uom: String!
    qty: Float!
    rateCard: Float
    benchmark: Float
    std: Float
    aiConf: String
    mleo: MLEOBreakdown
  }

  type VendorQuote {
    vendor: String!
    rate: Float!
    gst: Float!
    leadTime: String!
    validTill: String!
    isL1: Boolean!
  }

  type PurchaseRequest {
    id: String!
    tenantId: String
    title: String!
    projectName: String!
    costCentre: String!
    category: String!
    requester: String!
    reqDate: String
    requiredDate: String
    status: String!
    buyer: String
    remarks: String
    items: [BOQItem!]!
    quotes: [VendorQuote!]
  }

  type VendorMaster {
    id: String!
    name: String!
    category: String!
    rating: Float!
    isRateCard: Boolean!
    city: String
    leadTime: String
  }

  type MasterRateCard {
    code: String!
    cat: String!
    rate: String!
    uom: String!
    region: String!
  }

  type PPOItem {
    id: String!
    prId: String!
    vendor: String!
    itemDesc: String!
    unitRate: Float!
    qty: Float!
    totalVal: Float!
    taxRate: Float!
    taxAmount: Float!
    grandTotal: Float!
    paymentTerms: String!
    leadTime: String!
    status: String!
    createdDate: String!
  }

  type PurchaseOrder {
    id: String!
    ppoRef: String!
    prRef: String!
    vendor: String!
    amount: Float!
    issueDate: String!
    deliveryDate: String!
    status: String!
  }

  type AuditLog {
    time: String!
    user: String!
    action: String!
    detail: String!
  }

  type CacheStats {
    hits: Int!
    misses: Int!
    hitRatio: Float!
    activeEntries: Int!
    totalComputeSavedMs: Float!
    estimatedComputeHoursSaved: Float!
  }

  type QueryAuditEntry {
    id: String!
    querySignature: String!
    model: String!
    operation: String!
    durationMs: Float!
    timestamp: String!
    isSlowQuery: Boolean!
    isCached: Boolean!
  }

  type DatabaseAuditMetrics {
    totalQueries: Int!
    slowQueriesCount: Int!
    avgDurationMs: Float!
    cacheStats: CacheStats!
    recentSlowQueries: [QueryAuditEntry!]!
    estimatedComputeHoursTotal: Float!
    estimatedComputeHoursSaved: Float!
    efficiencyScore: Float!
  }

  input CreatePRItemInput {
    code: String!
    desc: String!
    uom: String!
    qty: Float!
    rateCard: Float
    benchmark: Float
    std: Float
    aiConf: String
  }

  input CreatePRInput {
    title: String!
    projectName: String!
    costCentre: String!
    category: String!
    requester: String!
    reqDate: String
    remarks: String
    items: [CreatePRItemInput!]
  }

  input CreatePPOInput {
    prId: String!
    vendor: String!
    itemDesc: String!
    unitRate: Float!
    qty: Float!
    taxRate: Float!
    paymentTerms: String!
    leadTime: String!
  }

  type Query {
    tenants: [Tenant!]!
    tenant(id: String, key: String): Tenant
    purchaseRequests(tenantId: String, status: String, limit: Int): [PurchaseRequest!]!
    purchaseRequest(id: String!): PurchaseRequest
    vendors(category: String, isRateCard: Boolean): [VendorMaster!]!
    masterRateCards(category: String, region: String): [MasterRateCard!]!
    ppos(status: String): [PPOItem!]!
    pos(status: String): [PurchaseOrder!]!
    auditLogs(limit: Int): [AuditLog!]!
    databaseAuditMetrics: DatabaseAuditMetrics!
  }

  type Mutation {
    createPurchaseRequest(input: CreatePRInput!): PurchaseRequest!
    approvePurchaseRequest(id: String!): PurchaseRequest
    createPPO(input: CreatePPOInput!): PPOItem!
    releasePO(ppoId: String!): PurchaseOrder!
    clearDatabaseCache(tag: String, clearAll: Boolean): Boolean!
  }
`);
