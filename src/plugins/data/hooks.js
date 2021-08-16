import { lazy, useEffect } from 'react';
import { loadPluginComponent, unloadDynamicScript } from './utils';
import { getConfig } from '../../config';

export function useDynamicPluginComponent(plugin) {
  // When this component unmounts, see if we should unload the script that provided it.
  // Note that this is not guaranteed to unload the script if other consumers are still using one
  // of its exports.
  useEffect(() => () => {
    unloadDynamicScript(plugin.url);
  }, []);

  return lazy(loadPluginComponent(plugin));
}

export function usePluginSlot(id) {
  if (getConfig().plugins[id] !== undefined) {
    return getConfig().plugins[id];
  }
  return null;
}
