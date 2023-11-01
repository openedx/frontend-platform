// eslint-disable-next-line import/prefer-default-export
export const hasDuplicateUrls = (pluginConfigs) => {
  const configUrls = pluginConfigs.map(config => config.url);
  const hasDuplicate = configUrls.filter((url, index) => configUrls.indexOf(url) !== index);
  return hasDuplicate.length > 0;
};
