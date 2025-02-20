/* eslint-disable import/no-extraneous-dependencies */
import { defineMessages } from '@edx/frontend-platform/i18n';
/* eslint-enable import/no-extraneous-dependencies */

const messages = defineMessages({
  'example.message': {
    id: 'example.message',
    defaultMessage: 'This message proves that i18n is working.',
    description: 'A message that proves that internationalization is working.',
  },
});

export default messages;
