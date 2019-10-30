export default function validateConfig(config, requester) {
  Object.keys(config).forEach((key) => {
    if (config[key] === undefined) {
      throw new Error(`Module configuration error: ${key} is required by ${requester}.`);
    }
  });
}
