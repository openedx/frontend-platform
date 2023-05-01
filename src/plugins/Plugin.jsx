import React from 'react';

import PluginIframe from './PluginIframe';
import PluginErrorBoundary from './PluginErrorBoundary';

import {
  IFRAME_PLUGIN,
} from './data/constants';
import { pluginShape } from './data/shapes';

export default function Plugin({ plugin, ...props }) {
  if (plugin === null) {
    return null;
  }

  let renderer = null;
  switch (plugin.type) {
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
