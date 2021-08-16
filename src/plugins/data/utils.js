import { COMPONENT_PLUGIN } from './constants';

// Primitive reference counting so that we don't load the same script twice.
const scriptLoadsByUrl = {};

export function loadDynamicScript(url) {
  return new Promise((resolve, reject) => {
    const scriptLoad = scriptLoadsByUrl[url];
    // If we've loaded this script already, increment the load count but don't try to load it again.
    if (scriptLoad !== undefined) {
      scriptLoadsByUrl[url].count += 1;
      return;
    }

    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      // eslint-disable-next-line no-console
      console.log(`Dynamic Script Loaded: ${url}`);
      // We've successfully loaded the script, so record that we did it.
      scriptLoadsByUrl[url] = { element, count: 1 };
      resolve(url);
    };

    element.onerror = () => {
      reject(new Error(`Failed to load dynamic script with URL: ${url}`));
    };

    document.head.appendChild(element);
  });
}

export function unloadDynamicScript(url) {
  const count = scriptLoadsByUrl[url];
  if (count !== undefined && count > 1) {
    scriptLoadsByUrl[url] -= 1;
  } else {
    document.head.removeChild(scriptLoadsByUrl[url].element);
    delete scriptLoadsByUrl[url];
  }
}

export function loadSharedModule(scope, module) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // eslint-disable-next-line no-undef
    await __webpack_init_sharing__('default');

    const container = window[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    // eslint-disable-next-line no-undef
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

export async function loadPluginComponent(plugin) {
  const { url, scope, module } = plugin;
  if (plugin.type === COMPONENT_PLUGIN) {
    await loadDynamicScript(url);
    return loadSharedModule(scope, module);
  }
  throw new Error(`loadPluginComponent: invalid plugin type ${plugin.type}, must be of type COMPONENT_PLUGIN.`);
}
