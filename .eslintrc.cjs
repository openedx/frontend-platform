// eslint-disable-next-line import/no-extraneous-dependencies
const { getBaseConfig } = require('@edx/frontend-build');

const config = getBaseConfig('eslint');

// Enable the eslint-plugin-jsdoc plugin
config.extends = ['@edx/eslint-config', 'plugin:jsdoc/recommended-typescript-flavor'];
config.plugins = [...(config.plugins ?? []), 'jsdoc'];
config.settings = {
  ...config.settings,
  jsdoc: { mode: 'typescript', preferredTypes: { object: 'Object' } },
};

config.rules = {
  'import/no-extraneous-dependencies': ['error', {
    devDependencies: [
      '**/*.config.js',
      '**/*.test.jsx',
      '**/*.test.js',
      'example/*',
    ],
  }],
  'import/extensions': ['error', 'always', {
    ignorePackages: true,
  }],
  'import/no-unresolved': ['error', {
    ignore: ['@edx/frontend-platform*'],
  }],
  'jsx-a11y/anchor-is-valid': ['error', {
    components: ['Link'],
    specialLink: ['to'],
    aspects: ['noHref', 'invalidHref', 'preferButton'],
  }],
  // There are too many missing descriptions to turn this on at the moment :/
  'jsdoc/require-property-description': ['off'],
  'jsdoc/require-param-description': ['off'],
  'jsdoc/require-returns-description': ['off'],
  'jsdoc/check-types': ['warn'],
  'jsdoc/tag-lines': ['off'],
};

module.exports = config;
