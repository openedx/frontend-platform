// @ts-check
// Since this is an "internal" component, we check props with typescript not propTypes.
/* eslint-disable react/prop-types */
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
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
  }

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
