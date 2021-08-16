import React, { Suspense } from 'react';
import PropTypes from 'prop-types';

import PluginErrorBoundary from './PluginErrorBoundary';

import { COMPONENT_PLUGIN } from './data/constants';
import { useDynamicPluginComponent } from './data/hooks';

function PluginComponent({ plugin, fallback, ...props }) {
  if (!plugin) {
    return null;
  }

  const Component = useDynamicPluginComponent(plugin);

  return (
    <PluginErrorBoundary>
      <Suspense fallback={fallback}>
        <Component {...props} {...plugin.props} />
      </Suspense>
    </PluginErrorBoundary>
  );
}

PluginComponent.propTypes = {
  plugin: PropTypes.shape({
    scope: PropTypes.string.isRequired,
    module: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    type: PropTypes.oneOf([COMPONENT_PLUGIN]).isRequired,
    props: PropTypes.object,
  }),
  fallback: PropTypes.node,
};

PluginComponent.defaultProps = {
  plugin: null,
  fallback: null,
};

export default PluginComponent;
