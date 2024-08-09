/* eslint-disable no-console */

// NOTE: This file is used by the example app. frontend-build expects the file
// to be in the root of the repository.  This is not used by the actual frontend-platform library.
// Also note that in an actual application, this file would be added to .gitignore.
const config = {
  JS_FILE_VAR: 'JS_FILE_VAR_VALUE_FOR_EXAMPLE_APP',
  componentPropOverrides: {
    targets: {
      example: {
        'data-dd-privacy': 'mask', // Custom `data-*` attribute (e.g., Datadog)
        'data-hj-suppress': '', // Custom `data-*` attribute (e.g., Hotjar)
        className: 'fs-mask', // Custom `className` attribute (e.g., Fullstory)
        onClick: (e) => { // Custom `onClick` attribute
          console.log('[env.config] onClick event for example', e);
        },
        style: { // Custom `style` attribute
          background: 'blue',
          color: 'white',
        },
      },
      example2: {
        'data-dd-privacy': 'mask', // Custom `data-*` attribute (e.g., Datadog)
        'data-hj-suppress': '', // Custom `data-*` attribute (e.g., Hotjar)
        className: 'fs-mask', // Custom `className` attribute (e.g., Fullstory)
        onClick: (e) => { // Custom `onClick` attribute
          console.log('[env.config] onClick event for example2', e);
        },
        style: { // Custom `style` attribute
          background: 'blue',
          color: 'white',
        },
      },
      example3: {
        'data-dd-action-name': 'example name', // Custom `data-*` attribute (e.g., Datadog)
      },
    },
  },
};

export default config;
