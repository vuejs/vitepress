module.exports = {
  preset: 'ts-jest',
  rootDir: __dirname,
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^client/(.*)$': '<rootDir>/src/client/$1',
    '^node/(.*)$': '<rootDir>/src/node/$1',
    '^shared/(.*)$': '<rootDir>/src/shared/$1',
    '^tests/(.*)$': '<rootDir>/__tests__/$1'
  },
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  testPathIgnorePatterns: ['/node_modules/']
}
