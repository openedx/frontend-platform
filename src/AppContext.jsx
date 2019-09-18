import React from 'react';
import { defaultAuthenticatedUser } from './frontendAuthWrapper';

const AppContext = React.createContext({
  authenticatedUser: defaultAuthenticatedUser,
  config: {},
});

export default AppContext;
