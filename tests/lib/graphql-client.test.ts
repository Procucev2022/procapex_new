import { executeGraphQL } from '@/lib/graphql-client';

describe('GraphQL Client Utility (executeGraphQL)', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should successfully execute query and return data', async () => {
    const mockResponse = {
      data: {
        tenants: [{ id: 'TNT-LNT-001', name: 'L&T' }],
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => mockResponse,
    });

    const result = await executeGraphQL('{ tenants { id } }', { limit: 10 }, 'GetTenants');
    expect(result.data).toEqual(mockResponse.data);
    expect(result.errors).toBeUndefined();
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should log warning when response contains graphql errors', async () => {
    const mockResponse = {
      errors: [{ message: 'Field does not exist on type Tenant' }],
    };

    global.fetch = jest.fn().mockResolvedValue({
      json: async () => mockResponse,
    });

    const result = await executeGraphQL('{ unknownField }', undefined, 'BrokenQuery');
    expect(result.errors).toBeDefined();
    expect(result.errors?.length).toBe(1);
    expect(result.errors?.[0].message).toContain('Field does not exist');
  });

  it('should catch network errors with error message', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch from /api/graphql'));

    const result = await executeGraphQL('{ tenants { id } }');
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe('Failed to fetch from /api/graphql');
  });

  it('should catch network errors without message property', async () => {
    global.fetch = jest.fn().mockRejectedValue('Unknown network fault');

    const result = await executeGraphQL('{ tenants { id } }');
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe('Network error executing GraphQL query');
  });
});
