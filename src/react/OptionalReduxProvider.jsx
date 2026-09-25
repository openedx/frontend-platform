import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

/**
 * @memberof module:React
 * @param {Object} props
 */
export default function OptionalReduxProvider({ store = null, children }) {
  if (store === null) {
    return children;
  }

  return (
    <Provider store={store}>
      <div data-testid="redux-provider">
        {children}
      </div>
    </Provider>
  );
}

OptionalReduxProvider.propTypes = {
  store: PropTypes.shape(),
  children: PropTypes.node.isRequired,
};
