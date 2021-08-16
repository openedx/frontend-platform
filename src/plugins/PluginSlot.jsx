import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { usePluginSlot } from './data/hooks';
import Plugin from './Plugin';

const PluginSlot = forwardRef(({
  as, id, pluginAs, ...props
}, ref) => {
  const { plugins } = usePluginSlot(id);

  const children = plugins.map((plugin) => (
    <Plugin plugin={plugin} as={pluginAs} />
  ));

  return React.createElement(
    as,
    {
      ...props,
      ref,
    },
    children,
  );
});

export default PluginSlot;

PluginSlot.propTypes = {
  id: PropTypes.string.isRequired,
  as: PropTypes.elementType,
  pluginAs: PropTypes.elementType,
};

PluginSlot.defaultProps = {
  as: 'div',
  pluginAs: null,
};
