/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { sendPageEvent } from '../analytics/index.js';

/**
 * A Wrapper component that calls `sendPageEvent` when it becomes active.
 *
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @param {Object} props
 */
export default function PageWrap({ children }) {
  const location = useLocation();

  useEffect(() => {
    sendPageEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return children;
}
