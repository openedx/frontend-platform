/* eslint-disable react/prop-types */
import React from 'react';
import { Route } from 'react-router-dom';
import { sendPageEvent } from '../analytics';

/**
 *
 *
 * @param {*} { component: Component, ...props }
 */
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
