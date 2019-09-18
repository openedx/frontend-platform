import merge from 'lodash.merge';

export default function mergeMessages(messagesArray = []) {
  return Array.isArray(messagesArray) ? merge({}, ...messagesArray) : {};
}
