const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTest.js',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
  ],
  testTimeout: 20000,
});
