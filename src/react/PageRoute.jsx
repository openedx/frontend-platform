/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { useMatch } from 'react-router-dom';
import { sendPageEvent } from '../analytics';

/**
 * A react-router Route component that calls `sendPageEvent` when it becomes active.
 *
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:React
 * @param {Object} props
 */
export default function PageRoute({ children, ...props }) {
  const match = useMatch({
    path: props.path,
    caseSensitive: props.sensitive,
    end: props.strict,
    exact: props.exact,
  });

  useEffect(() => {
    if (match) {
      sendPageEvent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(match)]);

  return children;
}
