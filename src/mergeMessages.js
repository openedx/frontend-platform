export default function mergeMessages(messagesArray) {
  return Object.assign({}, ...messagesArray);
}
