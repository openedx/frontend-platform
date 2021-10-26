import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  dispatchMountedEvent, dispatchReadyEvent, dispatchUnmountedEvent, useHostEvent,
} from './data/hooks';
import { PLUGIN_RESIZE } from './data/constants';

export default function PluginContainer({
  children, className, style, ready,
}) {
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });

  const finalStyle = useMemo(() => ({
    ...dimensions,
    ...style,
  }), [dimensions, style]);

  useHostEvent(PLUGIN_RESIZE, ({ payload }) => {
    setDimensions({
      width: payload.width,
      height: payload.height,
    });
  });

  useEffect(() => {
    dispatchMountedEvent();

    return () => {
      dispatchUnmountedEvent();
    };
  }, []);

  useEffect(() => {
    if (ready) {
      dispatchReadyEvent();
    }
  }, [ready]);

  return (
    <div className={className} style={finalStyle}>
      {children}
    </div>
  );
}

PluginContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  ready: PropTypes.bool,
  style: PropTypes.object, // eslint-disable-line
};

PluginContainer.defaultProps = {
  className: null,
  style: {},
  ready: true,
};
