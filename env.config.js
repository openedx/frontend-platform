// NOTE: This file is used by the example app.  frontend-build expects the file
// to be in the root of the repository.  This is not used by the actual frontend-platform library.
// Also note that in an actual application this file would be added to .gitignore.
const config = {
  JS_FILE_VAR: 'JS_FILE_VAR_VALUE_FOR_EXAMPLE_APP',
  externalLinkUrlOverrides: {
    "https://github.com/openedx/docs.openedx.org/": "https://docs.openedx.org/",
  }
};

export default config;
