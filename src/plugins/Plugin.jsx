import React from 'react';

import PluginIframe from './PluginIframe';
import PluginErrorBoundary from './PluginErrorBoundary';

import {
  IFRAME_PLUGIN,
} from './data/constants';
import { pluginConfigShape } from './data/shapes';

export default function Plugin({ config, ...props }) {
  if (config === null) {
    return null;
  }

  let renderer = null;
  switch (config.type) {
    case IFRAME_PLUGIN:
      renderer = (
        <PluginIframe config={config} {...props} />
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
  config: pluginConfigShape,
};

Plugin.defaultProps = {
  config: null,
};
