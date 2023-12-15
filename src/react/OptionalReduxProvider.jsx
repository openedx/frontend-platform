import React from 'react';
import { Provider } from 'react-redux';

/**
 * @memberof module:React
 * @param {Object} props
 * @param {import('redux').Store|null} props.store
 * @param {React.ReactNode} props.children
 */
export default function OptionalReduxProvider({ store = null, children }) {
  if (store === null) {
    return <>{children}</>;
  }

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
