import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
/* eslint-disable import/no-extraneous-dependencies */
import { logError } from '@edx/frontend-platform/logging';
/* eslint-enable import/no-extraneous-dependencies */

function useProvider(store) {
  const [Provider, setProvider] = useState(null); // Initially null to prevent render children that expect a Provider

  useEffect(() => {
    if (!store) {
      setProvider(() => ({ children }) => children); // Ensure fallback if no store
      return;
    }
    const loadProvider = async () => {
      try {
        const { Provider: ReactReduxProvider } = await import('react-redux');
        // Set the Provider from react-redux
        setProvider(() => ReactReduxProvider);
      } catch (error) {
        logError('Failed to load react-redux', error);
      }
    };
    loadProvider();
  }, [store]);

  return Provider;
}

/**
 * @memberof module:React
 * @param {Object} props
 */
export default function OptionalReduxProvider({ store = null, children }) {
  const Provider = useProvider(store);

  if (!Provider) {
    return null;
  }

  if (!store) {
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
