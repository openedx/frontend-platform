import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import { useDynamicPluginComponent } from './data/hooks';
import { pluginShape } from './data/shapes';

function PluginComponent({ plugin, fallback, ...props }) {
  if (!plugin) {
    return null;
  }

  const Component = useDynamicPluginComponent(plugin);

  return (
    <Suspense fallback={fallback}>
      <Component {...props} {...plugin.props} />
    </Suspense>
  );
}

PluginComponent.propTypes = {
  plugin: pluginShape,
  fallback: PropTypes.node,
};

PluginComponent.defaultProps = {
  plugin: null,
  fallback: null,
};

export default PluginComponent;
