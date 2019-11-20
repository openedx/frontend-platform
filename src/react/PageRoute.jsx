import React from 'react';
import { Route } from 'react-router-dom';
import { sendPageEvent } from '../../analytics';

// eslint-disable-next-line react/prop-types
export default function PageRoute({ component: Component, ...props }) {
  return (
    <Route
      {...props}
      component={(componentProps) => {
        sendPageEvent();
        return <Component {...componentProps} />;
      }}
    />
  );
}
