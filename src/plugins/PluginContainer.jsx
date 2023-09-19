'use client';

import React from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import PluginContainerIframe from './PluginContainerIframe';

import {
  IFRAME_PLUGIN,
} from './data/constants';
import { pluginConfigShape } from './data/shapes';

export default function PluginContainer({ config, ...props }) {
  if (config === null) {
    return null;
  }

  // this will allow for future plugin types to be inserted in the PluginErrorBoundary
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
    renderer
  );
}

PluginContainer.propTypes = {
  config: pluginConfigShape,
};

PluginContainer.defaultProps = {
  config: null,
};
