import React from 'react';

/**
 * @memberof React
 */
const AppContext = React.createContext({
  authenticatedUser: null,
  config: {},
});

export default AppContext;
