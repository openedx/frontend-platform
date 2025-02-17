/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendPageEvent } from '../analytics';

/**
 * A Wrapper component that calls `sendPageEvent` when it becomes active.
 *
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:React
 * @param {Object} props
 */
export default function PageWrap(_ref) {
  var children = _ref.children;
  var location = useLocation();
  useEffect(function () {
    sendPageEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  return children;
}
//# sourceMappingURL=PageWrap.js.map