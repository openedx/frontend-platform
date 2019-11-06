const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/tests/setupTest.js',
  ],
  testPathIgnorePatterns: [
    'dist',
  ],
});
