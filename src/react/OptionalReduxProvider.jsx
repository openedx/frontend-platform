import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

const DynamicProvider = lazy(() => import('react-redux')
  .then((module) => ({ default: module.Provider }))
  .catch(() => ({ default: ({ children }) => children })));

/**
 * @memberof module:React
 * @param {Object} props
 */
export default function OptionalReduxProvider({ store = null, children }) {
  if (store === null) {
    return children;
  }

  return (
    <Suspense fallback={null}>
      <DynamicProvider store={store}>
        <div data-testid="redux-provider">
          {children}
        </div>
      </DynamicProvider>
    </Suspense>
  );
}

OptionalReduxProvider.propTypes = {
  store: PropTypes.shape(),
  children: PropTypes.node.isRequired,
};
