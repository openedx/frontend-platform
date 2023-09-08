import React, { forwardRef } from 'react';

import classNames from 'classnames';
import { Spinner } from '@edx/paragon';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { usePluginSlot } from './data/hooks';
import PluginContainer from './PluginContainer';

const PluginSlot = forwardRef(({
  as, id, intl, pluginProps, children, ...props
}, ref) => {
  /* the plugins below are obtained by the id passed into PluginSlot by the Host MFE. See example/src/PluginsPage.jsx
  for an example of how PluginSlot is populated, and example/src/index.jsx for a dummy JS config that holds all plugins
  */
  const { plugins, keepDefault } = usePluginSlot(id);

  const { fallback } = pluginProps;

  // TODO: Add internationalization to the "Loading" text on the spinner.
  let finalFallback = (
    <div className={classNames(pluginProps.className, 'd-flex justify-content-center align-items-center')}>
      <Spinner animation="border" screenReaderText="Loading" />
    </div>
  );
  if (fallback !== undefined) {
    finalFallback = fallback;
  }

  let finalChildren = [];
  if (plugins.length > 0) {
    if (keepDefault) {
      finalChildren.push(children);
    }
    plugins.forEach((pluginConfig) => {
      finalChildren.push(
        <PluginContainer
          key={pluginConfig.url}
          config={pluginConfig}
          fallback={finalFallback}
          {...pluginProps}
        />,
      );
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

export default injectIntl(PluginSlot);

PluginSlot.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  pluginProps: PropTypes.object, // eslint-disable-line
};

PluginSlot.defaultProps = {
  as: 'div',
  children: null,
  pluginProps: {},
};
