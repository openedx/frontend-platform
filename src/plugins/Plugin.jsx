import React from 'react';

import PluginComponent from './PluginComponent';
import PluginIframe from './PluginIframe';
import PluginErrorBoundary from './PluginErrorBoundary';

import {
  COMPONENT_PLUGIN, IFRAME_PLUGIN,
} from './data/constants';
import { pluginShape } from './data/shapes';

export default function Plugin({ plugin, ...props }) {
  if (plugin === null) {
    return null;
  }

  let renderer = null;
  switch (plugin.type) {
    case COMPONENT_PLUGIN:
      renderer = (
        <PluginComponent plugin={plugin} {...props} />
      );
      break;
    case IFRAME_PLUGIN:
      renderer = (
        <PluginIframe plugin={plugin} {...props} />
      );
      break;
    // istanbul ignore next: default isn't meaningful, just satisfying linter
    default:
  }

  return (
    <PluginErrorBoundary>
      {renderer}
    </PluginErrorBoundary>
  );
}

Plugin.propTypes = {
  plugin: pluginShape,
};

Plugin.defaultProps = {
  plugin: null,
};
