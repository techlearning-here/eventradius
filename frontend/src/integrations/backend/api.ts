// Backend API Client - Refactored
// Incremental refactoring: types moved to ./types/index.ts, API client moved to client.ts

// Export all types from types directory
export * from './types';

// Export API client class and instance
export { ApiClient, apiClient } from './client';
