import packageJson from '@root_path/package.json';

/**
 * Checks if a given plugin is available by attempting to dynamically import it.
 *
 * This function tries to dynamically import a plugin based on its name. It constructs
 * a path using a predefined pattern that points to the plugin's location within
 * the `node_modules` directory. If the import succeeds, it means the plugin is available.
 *
 * @param {string} pluginName - The name of the plugin to check for availability.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the plugin is available, otherwise `false`.
 */
export const isPluginAvailable = async (pluginName) => {
  if (!pluginName) { return false; }

  try {
    await import(`@node_modules/@openedx-plugins/${pluginName}`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Retrieves a list of plugins that match a given prefix from the project's dependencies.
 *
 * This function filters the project's dependencies listed in the `package.json` file,
 * looking for ones that match a specified prefix. The prefix is used to identify related
 * plugins within the `@openedx-plugins` namespace. Each matching plugin's name is then
 * formatted and returned as part of an array of plugin objects, each containing the
 * plugin's `id` and `name`.
 *
 * @param {string} prefix - The prefix to filter plugins by.
 * @returns {Array<Object>} An array of objects, each representing a plugin. Each object
 *                          contains the `id` and `name` of the plugin.
 */
export const getPluginsByPrefix = (prefix) => {
  const dependenciesKeys = Object.keys(packageJson.dependencies);
  return dependenciesKeys.reduce(
    (pluginsFiltered, pluginName) => {
      if (pluginName.startsWith(`@openedx-plugins/${prefix}`)) {
        const pluginFormatted = pluginName.split('/')[1];
        const pluginData = {
          id: pluginFormatted,
          name: pluginFormatted,
        };
        return [...pluginsFiltered, pluginData];
      }
      return pluginsFiltered;
    },
    [],
  );
};
