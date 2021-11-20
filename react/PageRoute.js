/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { sendPageEvent } from '../analytics';
/**
 * A react-router Route component that calls `sendPageEvent` when it becomes active.
 *
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:React
 * @param {Object} props
 */

export default function PageRoute(props) {
  var match = useRouteMatch({
    path: props.path,
    exact: props.exact,
    strict: props.strict,
    sensitive: props.sensitive
  });
  useEffect(function () {
    if (match) {
      sendPageEvent();
    }
  }, [JSON.stringify(match)]);
  return /*#__PURE__*/React.createElement(Route, props);
}
//# sourceMappingURL=PageRoute.js.map