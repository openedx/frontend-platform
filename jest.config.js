const { createConfig } = require('@openedx/frontend-build');

module.exports = createConfig('jest', {
  setupFiles: [
    '<rootDir>/src/setupTest.js',
  ],
  testTimeout: 20000,
});
