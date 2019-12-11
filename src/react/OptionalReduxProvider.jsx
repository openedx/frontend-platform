import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

/**
 * @memberof module:React
 * @param {Object} props
 */
export default function OptionalReduxProvider({ store, children }) {
  if (store === null) {
    return (
      <React.Fragment>{children}</React.Fragment>
    );
  }

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}

OptionalReduxProvider.propTypes = {
  store: PropTypes.object, // eslint-disable-line
  children: PropTypes.node.isRequired,
};

OptionalReduxProvider.defaultProps = {
  store: null,
};
