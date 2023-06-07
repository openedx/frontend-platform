import React from 'react';

import PluginContainerIframe from './PluginContainerIframe';
import PluginErrorBoundary from './PluginErrorBoundary';

import {
  IFRAME_PLUGIN,
} from './data/constants';
import { pluginConfigShape } from './data/shapes';

export default function PluginContainer({ config, ...props }) {
  if (config === null) {
    return null;
  }

  let renderer = null;
  switch (config.type) {
    case IFRAME_PLUGIN:
      renderer = (
        <PluginContainerIframe config={config} {...props} />
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

PluginContainer.propTypes = {
  config: pluginConfigShape,
};

PluginContainer.defaultProps = {
  config: null,
};
