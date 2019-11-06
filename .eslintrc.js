const { createConfig } = require('@edx/frontend-build');

module.exports = createConfig('eslint', {
  rules: {
    "no-trailing-spaces":  [
      "error",
      {
        "ignoreComments": true,
      },
    ],
    "max-len": [
      "error",
      120,
      2,
      {
        "ignoreUrls": true,
        "ignoreComments": false,
        "ignoreRegExpLiterals": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
      },
    ],
  },
});
