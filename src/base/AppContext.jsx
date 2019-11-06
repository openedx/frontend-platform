import React from 'react';

const AppContext = React.createContext({
  authenticatedUser: null,
  config: {},
});

export default AppContext;
