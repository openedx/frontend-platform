import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { usePluginSlot } from './data/hooks';
import PluginContainer from './PluginContainer';

const PluginSlot = forwardRef(({
  as, id, pluginProps, children, ...props
}, ref) => {
  const { plugins, keepDefault } = usePluginSlot(id);

  let finalChildren = [];
  if (plugins.length > 0) {
    if (keepDefault) {
      finalChildren.push(children);
    }
    plugins.forEach((pluginConfig) => {
      finalChildren.push(<PluginContainer key={pluginConfig.url} config={pluginConfig} {...pluginProps} />);
    });
  } else {
    finalChildren = children;
  }

  return React.createElement(
    as,
    {
      ...props,
      ref,
    },
    finalChildren,
  );
});

export default PluginSlot;

PluginSlot.propTypes = {
  id: PropTypes.string.isRequired,
  as: PropTypes.elementType,
  children: PropTypes.node,
  pluginProps: PropTypes.object, // eslint-disable-line
};

PluginSlot.defaultProps = {
  as: 'div',
  children: null,
};
