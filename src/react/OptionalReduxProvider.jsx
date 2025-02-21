import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function useProvider(store) {
  const [Provider, setProvider] = useState(null);
  useEffect(() => {
    if (!store) {
      setProvider(() => ({ children: c }) => c);
      return;
    }
    if (process.env.NODE_ENV === 'test') {
      // In test environments, load react-redux synchronously to avoid async state updates.
      try {
        // eslint-disable-next-line global-require
        const module = require('react-redux');
        setProvider(() => module.Provider);
      } catch {
        setProvider(() => ({ children: c }) => c);
      }
    } else {
      // In production, load react-redux dynamically.
      import('react-redux')
        .then((module) => {
          setProvider(() => module.Provider);
        })
        .catch(() => {
          setProvider(() => ({ children: c }) => c);
        });
    }
  }, [store]);
  return Provider;
}

/**
 * @memberof module:React
 * @param {Object} props
 */
export default function OptionalReduxProvider({ store = null, children }) {
  const Provider = useProvider(store);

  // If the Provider is not loaded yet, we return null to avoid rendering issues
  if (!Provider) {
    return null;
  }

  // If the store is null, we return the children directly as no Provider is needed
  if (store === null) {
    return children;
  }

  // If the Provider is loaded and the store is not null, we render the Provider with the children
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
