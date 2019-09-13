export default function mergeMessages(messagesArray = []) {
  return Array.isArray(messagesArray) ? Object.assign({}, ...messagesArray) : {};
}
