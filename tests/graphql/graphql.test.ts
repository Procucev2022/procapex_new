/**
 * @jest-environment node
 */
import { POST, GET } from '@/app/api/graphql/route';
import { executeGraphQL } from '@/lib/graphql-client';
import { resolvers } from '@/graphql/resolvers';
import { dbCache } from '@/lib/db-cache';
import { dbAuditor } from '@/lib/db-auditor';
import { NextRequest } from 'next/server';

function createRequest(body?: unknown, method = 'POST', url = 'http://localhost:3000/api/graphql'): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

describe('GraphQL API & Resolvers Suite (/api/graphql)', () => {
  beforeEach(() => {
    dbCache.invalidateAll();
    dbAuditor.reset();
  });

  describe('Query Resolvers', () => {
    it('should query all tenants with nested user records', async () => {
      const query = `
        query GetAllTenants {
          tenants {
            id
            key
            name
            short
            project
            users {
              role
              name
              title
            }
          }
        }
      `;

      const req = createRequest({ query });
      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.tenants.length).toBe(4);
      expect(json.data.tenants[0].name).toBeDefined();
      expect(json.data.tenants[0].users.length).toBeGreaterThan(0);
      expect(json.extensions?.correlationId).toMatch(/^gql-/);
      expect(json.extensions?.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should query a single tenant by key or id', async () => {
      const queryByKey = `
        query GetTenant {
          tenant(key: "TNT_LNT") {
            id
            name
            project
          }
        }
      `;

      const req1 = createRequest({ query: queryByKey });
      const res1 = await POST(req1);
      const json1 = await res1.json();
      expect(json1.data.tenant.id).toBe('TNT-LNT-001');

      const queryById = `
        query GetTenantById {
          tenant(id: "TNT-TATA-002") {
            id
            key
            name
          }
        }
      `;
      const req2 = createRequest({ query: queryById });
      const res2 = await POST(req2);
      const json2 = await res2.json();
      expect(json2.data.tenant.key).toBe('TNT_TATA');

      // Non-existent tenant returns null
      const req3 = createRequest({ query: '{ tenant(key: "UNKNOWN") { id } }' });
      const res3 = await POST(req3);
      const json3 = await res3.json();
      expect(json3.data.tenant).toBeNull();
    });

    it('should handle tenant query with no args or invalid id', async () => {
      const qEmpty = `query { tenant { id } }`;
      const resEmpty = await POST(createRequest({ query: qEmpty }));
      const jsonEmpty = await resEmpty.json();
      expect(jsonEmpty.data.tenant).toBeNull();

      const qBadId = `query { tenant(id: "TNT_NOT_EXISTING") { id } }`;
      const resBadId = await POST(createRequest({ query: qBadId }));
      const jsonBadId = await resBadId.json();
      expect(jsonBadId.data.tenant).toBeNull();
    });

    it('should query purchase requests with filtering and limit', async () => {
      const query = `
        query GetPRs {
          purchaseRequests(status: "SUBMITTED", limit: 2) {
            id
            title
            status
            items {
              code
              desc
              qty
            }
            quotes {
              vendor
              rate
            }
          }
        }
      `;

      const req = createRequest({ query });
      const res = await POST(req);
      const json = await res.json();
      expect(json.data.purchaseRequests).toBeDefined();
      expect(json.data.purchaseRequests.length).toBeLessThanOrEqual(2);
      if (json.data.purchaseRequests.length > 0) {
        expect(json.data.purchaseRequests[0].status).toBe('SUBMITTED');
        expect(json.data.purchaseRequests[0].items.length).toBeGreaterThan(0);
      }
    });

    it('should query purchase requests with tenantId, default args, and non-positive limit', async () => {
      const qTenant = `
        query {
          purchaseRequests(tenantId: "TNT-LNT-001") {
            id
            tenantId
          }
        }
      `;
      const resTenant = await POST(createRequest({ query: qTenant }));
      const jsonTenant = await resTenant.json();
      expect(jsonTenant.data.purchaseRequests).toBeDefined();

      const qDefaults = `
        query {
          purchaseRequests {
            id
          }
        }
      `;
      const resDefaults = await POST(createRequest({ query: qDefaults }));
      const jsonDefaults = await resDefaults.json();
      expect(jsonDefaults.data.purchaseRequests.length).toBeGreaterThan(0);

      const qNegativeLimit = `
        query {
          purchaseRequests(limit: -1) {
            id
          }
        }
      `;
      const resNeg = await POST(createRequest({ query: qNegativeLimit }));
      const jsonNeg = await resNeg.json();
      expect(jsonNeg.data.purchaseRequests.length).toBeGreaterThan(0);
    });

    it('should query single purchase request by id', async () => {
      const query = `
        query GetSinglePR {
          purchaseRequest(id: "PR-2026-0005") {
            id
            title
            remarks
            items {
              code
              qty
            }
          }
        }
      `;

      const req = createRequest({ query });
      const res = await POST(req);
      const json = await res.json();
      expect(json.data.purchaseRequest.id).toBe('PR-2026-0005');

      // Non-existent PR
      const reqMissing = createRequest({ query: '{ purchaseRequest(id: "NON_EXISTENT") { id } }' });
      const resMissing = await POST(reqMissing);
      const jsonMissing = await resMissing.json();
      expect(jsonMissing.data.purchaseRequest).toBeNull();
    });

    it('should query vendors, master rate cards, ppos, pos, and audit logs', async () => {
      const query = `
        query GetProcurementData {
          vendors(category: "INTERIOR", isRateCard: true) {
            id
            name
            rating
          }
          masterRateCards(category: "Civil", region: "North") {
            code
            cat
            rate
          }
          ppos(status: "TIER_1_PENDING") {
            id
            prId
            grandTotal
          }
          pos(status: "ISSUED") {
            id
            status
          }
          auditLogs(limit: 5) {
            user
            action
          }
        }
      `;

      const req = createRequest({ query });
      const res = await POST(req);
      const json = await res.json();

      expect(json.data.vendors.length).toBeGreaterThan(0);
      expect(json.data.masterRateCards.length).toBeGreaterThan(0);
      expect(json.data.ppos.length).toBeGreaterThan(0);
      expect(json.data.pos.length).toBeGreaterThan(0);
      expect(json.data.auditLogs.length).toBeGreaterThan(0);
    });

    it('should query vendors with no args, isRateCard false, and category only', async () => {
      const qAll = `query { vendors { id isRateCard category } }`;
      const resAll = await POST(createRequest({ query: qAll }));
      const jsonAll = await resAll.json();
      expect(jsonAll.data.vendors.length).toBeGreaterThan(0);

      const qFalse = `query { vendors(isRateCard: false) { id isRateCard } }`;
      const resFalse = await POST(createRequest({ query: qFalse }));
      const jsonFalse = await resFalse.json();
      expect(jsonFalse.data.vendors).toBeDefined();

      const qCatOnly = `query { vendors(category: "HVAC") { id category } }`;
      const resCatOnly = await POST(createRequest({ query: qCatOnly }));
      const jsonCatOnly = await resCatOnly.json();
      expect(jsonCatOnly.data.vendors).toBeDefined();
    });

    it('should query master rate cards with no args and region only', async () => {
      const qAll = `query { masterRateCards { code cat region } }`;
      const resAll = await POST(createRequest({ query: qAll }));
      const jsonAll = await resAll.json();
      expect(jsonAll.data.masterRateCards.length).toBeGreaterThan(0);

      const qRegion = `query { masterRateCards(region: "North") { code region } }`;
      const resRegion = await POST(createRequest({ query: qRegion }));
      const jsonRegion = await resRegion.json();
      expect(jsonRegion.data.masterRateCards.length).toBeGreaterThan(0);
    });

    it('should query ppos and pos without status argument', async () => {
      const qPPOs = `query { ppos { id status } }`;
      const resPPOs = await POST(createRequest({ query: qPPOs }));
      const jsonPPOs = await resPPOs.json();
      expect(jsonPPOs.data.ppos.length).toBeGreaterThan(0);

      const qPOs = `query { pos { id status } }`;
      const resPOs = await POST(createRequest({ query: qPOs }));
      const jsonPOs = await resPOs.json();
      expect(jsonPOs.data.pos.length).toBeGreaterThan(0);
    });

    it('should query audit logs without limit and with non-positive limit', async () => {
      const qNoLimit = `query { auditLogs { time user action } }`;
      const resNoLimit = await POST(createRequest({ query: qNoLimit }));
      const jsonNoLimit = await resNoLimit.json();
      expect(jsonNoLimit.data.auditLogs.length).toBeGreaterThan(0);

      const qZeroLimit = `query { auditLogs(limit: 0) { user action } }`;
      const resZeroLimit = await POST(createRequest({ query: qZeroLimit }));
      const jsonZeroLimit = await resZeroLimit.json();
      expect(jsonZeroLimit.data.auditLogs.length).toBeGreaterThan(0);
    });

    it('should query database audit & compute optimization metrics', async () => {
      // First prime the cache with a query
      await POST(createRequest({ query: '{ tenants { id } }' }));
      // Second query to trigger a cache hit
      await POST(createRequest({ query: '{ tenants { id } }' }));

      const query = `
        query GetMetrics {
          databaseAuditMetrics {
            totalQueries
            slowQueriesCount
            avgDurationMs
            efficiencyScore
            cacheStats {
              hits
              misses
              hitRatio
              activeEntries
              totalComputeSavedMs
              estimatedComputeHoursSaved
            }
            recentSlowQueries {
              id
              querySignature
            }
          }
        }
      `;

      const req = createRequest({ query });
      const res = await POST(req);
      const json = await res.json();

      expect(json.data.databaseAuditMetrics).toBeDefined();
      expect(json.data.databaseAuditMetrics.totalQueries).toBeGreaterThan(0);
      expect(json.data.databaseAuditMetrics.cacheStats.hits).toBeGreaterThan(0);
      expect(json.data.databaseAuditMetrics.efficiencyScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Mutation Resolvers', () => {
    it('should create new purchase request and invalidate cache', async () => {
      const mutation = `
        mutation CreatePR {
          createPurchaseRequest(input: {
            title: "Reinforced Structural Beams"
            projectName: "Metro Line 4 Pier Cap"
            costCentre: "CC-102 (Structural)"
            category: "Civil"
            requester: "Amit Sharma"
            items: [
              { code: "STL-BEAM-01", desc: "Heavy Steel Beam", uom: "Nos", qty: 20 }
            ]
          }) {
            id
            title
            status
            items {
              code
              qty
            }
          }
        }
      `;

      const req = createRequest({ query: mutation });
      const res = await POST(req);
      const json = await res.json();

      expect(json.data.createPurchaseRequest.id).toMatch(/^PR-2026-/);
      expect(json.data.createPurchaseRequest.title).toBe('Reinforced Structural Beams');
      expect(json.data.createPurchaseRequest.items.length).toBe(1);
    });

    it('should create purchase request with optional fields omitted', async () => {
      const mutation = `
        mutation {
          createPurchaseRequest(input: {
            title: "Minimal PR"
            projectName: "Project X"
            costCentre: "CC-999"
            category: "General"
            requester: "Tester"
          }) {
            id
            title
            remarks
            items {
              code
            }
            reqDate
          }
        }
      `;
      const res = await POST(createRequest({ query: mutation }));
      const json = await res.json();
      expect(json.data.createPurchaseRequest.remarks).toBe('');
      expect(json.data.createPurchaseRequest.items).toEqual([]);
      expect(json.data.createPurchaseRequest.reqDate).toBeDefined();
    });

    it('should create purchase request with completely empty input and approve it via resolver', async () => {
      const created = await resolvers.createPurchaseRequest({ input: {} });
      expect(created.title).toBe('');
      expect(created.projectName).toBe('');
      expect(created.costCentre).toBe('');
      expect(created.category).toBe('');
      expect(created.requester).toBe('');

      // Query single PR without initial quotes
      const singlePr = await resolvers.purchaseRequest({ id: created.id });
      expect(singlePr?.quotes).toEqual([]);

      // Approve PR without initial quotes
      const approved = await resolvers.approvePurchaseRequest({ id: created.id });
      expect(approved?.status).toBe('APPROVED_BY_PROJECT_HEAD');
      expect(approved?.quotes).toEqual([]);
    });

    it('should approve a purchase request and update its status', async () => {
      const mutation = `
        mutation ApprovePR {
          approvePurchaseRequest(id: "PR-2026-0005") {
            id
            status
          }
        }
      `;

      const req = createRequest({ query: mutation });
      const res = await POST(req);
      const json = await res.json();

      expect(json.data.approvePurchaseRequest.id).toBe('PR-2026-0005');
      expect(json.data.approvePurchaseRequest.status).toBe('APPROVED_BY_PROJECT_HEAD');
    });

    it('should return null when approving non-existent PR', async () => {
      const mutation = `
        mutation {
          approvePurchaseRequest(id: "PR-NON-EXISTENT") {
            id
          }
        }
      `;
      const res = await POST(createRequest({ query: mutation }));
      const json = await res.json();
      expect(json.data.approvePurchaseRequest).toBeNull();
    });

    it('should create PPO and release PO successfully', async () => {
      const ppoMutation = `
        mutation CreatePPO {
          createPPO(input: {
            prId: "PR-2026-0005"
            vendor: "DesignCraft Millworks"
            itemDesc: "Complete Joinery Package"
            unitRate: 100000
            qty: 1
            taxRate: 18
            paymentTerms: "30 Days Net"
            leadTime: "15 Days"
          }) {
            id
            prId
            grandTotal
            status
          }
        }
      `;

      const ppoReq = createRequest({ query: ppoMutation });
      const ppoRes = await POST(ppoReq);
      const ppoJson = await ppoRes.json();
      const ppoId = ppoJson.data.createPPO.id;

      expect(ppoId).toMatch(/^PPO-2026-/);
      expect(ppoJson.data.createPPO.grandTotal).toBe(118000);

      // Release PO
      const poMutation = `
        mutation ReleasePO($id: String!) {
          releasePO(ppoId: $id) {
            id
            ppoRef
            status
          }
        }
      `;

      const poReq = createRequest({ query: poMutation, variables: { id: ppoId } });
      const poRes = await POST(poReq);
      const poJson = await poRes.json();

      expect(poJson.data.releasePO.id).toMatch(/^PO-2026-/);
      expect(poJson.data.releasePO.ppoRef).toBe(ppoId);
      expect(poJson.data.releasePO.status).toBe('ISSUED');
    });

    it('should release PO with fallback fields when PPO is not found', async () => {
      const mutation = `
        mutation {
          releasePO(ppoId: "PPO-DOES-NOT-EXIST") {
            id
            ppoRef
            prRef
            vendor
            amount
            status
          }
        }
      `;
      const res = await POST(createRequest({ query: mutation }));
      const json = await res.json();
      expect(json.data.releasePO.ppoRef).toBe('PPO-DOES-NOT-EXIST');
      expect(json.data.releasePO.vendor).toBe('Vendor');
      expect(json.data.releasePO.amount).toBe(100000);
      expect(json.data.releasePO.status).toBe('ISSUED');
    });

    it('should clear database cache via mutation by tag', async () => {
      dbCache.set('test_k', 'data', ['tag_x']);
      expect(dbCache.get('test_k')).toBe('data');

      const mutation = `
        mutation ClearCache {
          clearDatabaseCache(tag: "tag_x")
        }
      `;

      const req = createRequest({ query: mutation });
      const res = await POST(req);
      const json = await res.json();

      expect(json.data.clearDatabaseCache).toBe(true);
      expect(dbCache.get('test_k')).toBeUndefined();
    });

    it('should clear entire database cache when no tag is passed to clearDatabaseCache mutation', async () => {
      dbCache.set('key_all', 'val');
      const mutation = `
        mutation {
          clearDatabaseCache
        }
      `;
      const res = await POST(createRequest({ query: mutation }));
      const json = await res.json();
      expect(json.data.clearDatabaseCache).toBe(true);
      expect(dbCache.get('key_all')).toBeUndefined();
    });
  });

  describe('AES Encryption & Secure Data Processing Operations', () => {
    it('should encrypt sensitive string data via encryptData query', async () => {
      const query = `
        query EncryptTest {
          encryptData(input: { data: "Sensitive Banking IFSC: HDFC0001234", aad: "bank-context" }) {
            algorithm
            iv
            tag
            salt
            ciphertext
            serialized
          }
        }
      `;

      const res = await POST(createRequest({ query }));
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data.encryptData).toBeDefined();
      expect(json.data.encryptData.algorithm).toBe('aes-256-gcm');
      expect(json.data.encryptData.serialized).toMatch(/^enc:v1:aes-256-gcm:/);
    });

    it('should decrypt encrypted data using serialized format and individual bundle fields', async () => {
      // 1. Encrypt first
      const encryptQuery = `
        query {
          encryptData(input: { data: "Target Negotiation Limit: 500000" }) {
            serialized
            ciphertext
            iv
            salt
            tag
            algorithm
          }
        }
      `;
      const encRes = await POST(createRequest({ query: encryptQuery }));
      const encJson = await encRes.json();
      const encData = encJson.data.encryptData;

      // 2. Decrypt with serialized string
      const decryptSerializedQuery = `
        query {
          decryptData(input: { serializedOrCiphertext: "${encData.serialized}" })
        }
      `;
      const decRes1 = await POST(createRequest({ query: decryptSerializedQuery }));
      const decJson1 = await decRes1.json();
      expect(decJson1.data.decryptData).toBe('Target Negotiation Limit: 500000');

      // 3. Decrypt with individual bundle fields
      const decryptFieldsQuery = `
        query {
          decryptData(input: {
            serializedOrCiphertext: "${encData.ciphertext}"
            iv: "${encData.iv}"
            salt: "${encData.salt}"
            tag: "${encData.tag}"
            algorithm: "${encData.algorithm}"
          })
        }
      `;
      const decRes2 = await POST(createRequest({ query: decryptFieldsQuery }));
      const decJson2 = await decRes2.json();
      expect(decJson2.data.decryptData).toBe('Target Negotiation Limit: 500000');

      // 4. Decrypt with individual bundle fields omitting algorithm, iv, salt
      await expect(
        resolvers.decryptData({ input: { serializedOrCiphertext: 'raw' } })
      ).rejects.toThrow();
    });

    it('should securely encrypt and update PPO payment terms via mutation', async () => {
      // Create PPO first
      const ppoMutation = `
        mutation {
          createPPO(input: {
            prId: "PR-2026-0005"
            vendor: "Secure Logistics Corp"
            itemDesc: "Armored Transport"
            unitRate: 50000
            qty: 2
            taxRate: 18
            paymentTerms: "Plaintext Pre-Update"
            leadTime: "3 Days"
          }) {
            id
          }
        }
      `;
      const ppoRes = await POST(createRequest({ query: ppoMutation }));
      const ppoJson = await ppoRes.json();
      const ppoId = ppoJson.data.createPPO.id;

      // Secure update with AES encryption
      const secureUpdateMutation = `
        mutation SecureUpdate($id: String!) {
          secureUpdatePPOPaymentTerms(ppoId: $id, paymentTerms: "Confidential: 100% LC at sight") {
            id
            paymentTerms
          }
        }
      `;
      const updateRes = await POST(
        createRequest({ query: secureUpdateMutation, variables: { id: ppoId } })
      );
      const updateJson = await updateRes.json();

      expect(updateJson.data.secureUpdatePPOPaymentTerms.id).toBe(ppoId);
      expect(updateJson.data.secureUpdatePPOPaymentTerms.paymentTerms).toMatch(/^enc:v1:aes-256-gcm:/);
    });

    it('should return error when attempting secureUpdatePPOPaymentTerms on non-existent PPO', async () => {
      const secureUpdateMutation = `
        mutation {
          secureUpdatePPOPaymentTerms(ppoId: "PPO-NON-EXISTENT", paymentTerms: "Terms") {
            id
          }
        }
      `;
      const updateRes = await POST(createRequest({ query: secureUpdateMutation }));
      const updateJson = await updateRes.json();

      expect(updateJson.errors).toBeDefined();
      expect(updateJson.errors[0].message).toContain('PPO not found');
    });
  });

  describe('Validation & Error Scenarios', () => {
    it('should reject request missing query field with 400', async () => {
      const req = createRequest({ invalidPayload: true });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.errors[0].message).toContain('valid GraphQL query string');
    });

    it('should reject payload exceeding maximum query length with 413', async () => {
      const hugeQuery = 'query TooLong { ' + 'a'.repeat(6000) + ' }';
      const req = createRequest({ query: hugeQuery });
      const res = await POST(req);

      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.errors[0].extensions.code).toBe('QUERY_TOO_COMPLEX');
    });

    it('should return syntax errors on invalid GraphQL syntax with 200 GraphQL response', async () => {
      const invalidSyntax = 'query { invalidSyntaxHere %^&* }';
      const req = createRequest({ query: invalidSyntax });
      const res = await POST(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThan(0);
    });

    it('should handle unhandled JSON parsing error with 500 status', async () => {
      const faultyReq = {
        json: jest.fn().mockRejectedValue(new Error('Corrupted JSON Stream')),
      } as unknown as NextRequest;

      const res = await POST(faultyReq);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.errors[0].message).toContain('Corrupted JSON Stream');
    });

    it('should handle unhandled exception with fallback error message when error.message is missing', async () => {
      const faultyReq = {
        json: jest.fn().mockRejectedValue({}),
      } as unknown as NextRequest;

      const res = await POST(faultyReq);
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.errors[0].message).toBe('Internal GraphQL execution error');
    });

    it('should execute operation with operationName and variables provided in POST payload', async () => {
      const query = `
        query NamedOp($id: String!) {
          purchaseRequest(id: $id) {
            id
            title
          }
        }
      `;
      const req = createRequest({
        query,
        operationName: 'NamedOp',
        variables: { id: 'PR-2026-0005' },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.purchaseRequest.id).toBe('PR-2026-0005');
    });

    it('should use development environment fallback when NODE_ENV is unset', async () => {
      const origEnv = process.env.NODE_ENV;
      delete (process.env as any).NODE_ENV;
      const res = await POST(createRequest({ query: '{ tenants { id } }' }));
      expect(res.status).toBe(200);
      (process.env as any).NODE_ENV = origEnv;
    });
  });

  describe('GET Endpoint & Healthcheck', () => {
    it('should respond to GET request with API status and metrics', async () => {
      const req = new NextRequest('http://localhost:3000/api/graphql?query={ tenants { id } }');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('GraphQL API Ready');
      expect(json.schemaVersion).toBe('1.0.0');
      expect(json.metrics).toBeDefined();
      expect(json.sampleResult.data.tenants).toBeDefined();
    });

    it('should respond to GET request without query param using default introspection query', async () => {
      const req = new NextRequest('http://localhost:3000/api/graphql');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('GraphQL API Ready');
      expect(json.sampleResult.data).toBeDefined();
    });
  });

  describe('GraphQL Client Helper', () => {
    it('should execute query successfully using executeGraphQL helper', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        json: async () => ({
          data: { tenants: [{ id: 'TNT-LNT-001' }] },
        }),
      });
      global.fetch = mockFetch;

      const result = await executeGraphQL<{ tenants: Array<{ id: string }> }>(
        '{ tenants { id } }',
        undefined,
        'TestOp'
      );
      expect(result.data?.tenants[0]?.id).toBe('TNT-LNT-001');
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/graphql',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should return error response when executeGraphQL catches exception', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network offline'));

      const result = await executeGraphQL('{ tenants { id } }');
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].message).toBe('Network offline');
    });
  });
});
