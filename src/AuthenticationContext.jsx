import React from 'react';
import { defaultAuthentication } from './frontendAuthWrapper';

const AuthenticationContext = React.createContext(defaultAuthentication);

export default AuthenticationContext;

