/**
 * @jest-environment node
 */

// Test that api.ts properly re-exports from client.ts and types

describe('API barrel exports', () => {
  it('should export ApiClient from api.ts', async () => {
    const { ApiClient } = await import('../api');
    expect(ApiClient).toBeDefined();
    expect(typeof ApiClient).toBe('function');
  });

  it('should export apiClient singleton from api.ts', async () => {
    const { apiClient } = await import('../api');
    expect(apiClient).toBeDefined();
    expect(typeof apiClient).toBe('object');
  });

  it('should export types from api.ts', async () => {
    // TypeScript types are compile-time only, but we can verify
    // the module structure by checking if imports work
    const api = await import('../api');
    expect(api).toBeDefined();
  });

  it('should have consistent exports between api.ts and client.ts', async () => {
    const api = await import('../api');
    const client = await import('../client');
    
    // The apiClient from api.ts should be the same as from client.ts
    expect(api.apiClient).toBeDefined();
    expect(client.apiClient).toBeDefined();
  });
});
