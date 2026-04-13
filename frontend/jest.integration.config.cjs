/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/integration/setup.ts',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/__tests__/integration/**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
      },
    },
  },
  // Longer timeout for API calls
  testTimeout: 30000,
  // Verbose output for integration tests
  verbose: true,
};

module.exports = config;
