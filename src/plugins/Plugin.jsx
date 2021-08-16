import React from 'react';
import PropTypes from 'prop-types';

import {
  COMPONENT_PLUGIN, IFRAME_PLUGIN,
} from './data/constants';
import PluginComponent from './PluginComponent';
import PluginIframe from './PluginIframe';
import PluginErrorBoundary from './PluginErrorBoundary';

export default function Plugin({ as, plugin, ...props }) {
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
    default:
  }

  const element = (
    <PluginErrorBoundary>
      {renderer}
    </PluginErrorBoundary>
  );

  // If we've been asked to wrap this with a particular component or DOM element ('as'), then do so
  // and dump our element into it.
  if (as) {
    return React.createElement(
      as,
      {
        ...props,
      },
      element,
    );
  }

  // Otherwise just return the element unwrapped.
  return element;
}

Plugin.propTypes = {
  plugin: PropTypes.shape({
    scope: PropTypes.string,
    module: PropTypes.string,
    url: PropTypes.string.isRequired,
    type: PropTypes.oneOf([COMPONENT_PLUGIN, IFRAME_PLUGIN]).isRequired,
    props: PropTypes.object,
  }),
};

Plugin.defaultProps = {
  plugin: null,
};
