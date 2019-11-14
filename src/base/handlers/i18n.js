import merge from 'lodash.merge';

import { configure } from '../../i18n';

export function mergeMessages(messagesArray = []) {
  return Array.isArray(messagesArray) ? merge({}, ...messagesArray) : {};
}

export default async function i18n(app) {
  const messages = Array.isArray(app.messages) ? mergeMessages(app.messages) : app.messages;
  configure({ ...app.config, loggingService: app.loggingService }, messages);
}
