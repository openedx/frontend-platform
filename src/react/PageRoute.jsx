/* eslint-disable react/prop-types */
import React from 'react';
import { Route } from 'react-router-dom';
import { sendPageEvent } from '../analytics';

/**
 * A react-router route that calls `sendPageEvent` when it becoems active.
 *
 * @memberof module:React
 * @see {@link module:Analytics~sendPageEvent}
 * @param {Object} props
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
