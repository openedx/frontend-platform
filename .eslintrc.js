// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@openedx/frontend-build');

const config = getBaseConfig('eslint');

config.globals = { globalThis: 'readonly' };
config.rules = {
  'import/no-extraneous-dependencies': ['error', {
    devDependencies: [
      '**/*.config.js',
      '**/*.test.jsx',
      '**/*.test.js',
      'example/*',
    ],
  }],
  'import/extensions': ['error', {
    ignore: ['@edx/frontend-platform*'],
  }],
  'import/no-unresolved': ['error', {
    ignore: ['@edx/frontend-platform*'],
  }],
  'jsx-a11y/anchor-is-valid': ['error', {
    components: ['Link'],
    specialLink: ['to'],
    aspects: ['noHref', 'invalidHref', 'preferButton'],
  }],
};

module.exports = config;
