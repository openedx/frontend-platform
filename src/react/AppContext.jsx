import React from 'react';

/**
 * @memberof module:React
 */
const AppContext = React.createContext({
  authenticatedUser: null,
  config: {},
});

export default AppContext;
