import React, { forwardRef } from 'react';
import { useComponentPropOverrides } from './hooks';

/**
 * A Higher-Order Component (HOC) that enhances the wrapped component with custom props via
 * the `useComponentPropOverrides` hook to merge any custom props from configuration with the
 * actual component props.
 *
 * @param {string} [target] - The target used to identify any custom props for a given element.
 * @param {ComponentPropOverridesOptions} [options] - Optional configuration for the HOC.
 *
 * @example
 * // Given a configuration like:
 * {
 *   componentPropOverrides: {
 *     targets: {
 *       example: {
 *         'data-dd-privacy': 'mask',
 *         'data-hj-suppress': '',
 *         className: 'fs-mask',
 *       },
 *     },
 *   },
 * }
 *
 * // and calling the HOC as follows:
 * const ComponentWithPropOverrides = withComponentPropOverrides('example')(MyComponent);
 * <ComponentWithPropOverrides otherProp="value" />
 *
 * // The resulting `ComponentWithPropOverrides` will render `MyComponent` with the following props:
 * { otherProp: 'value', 'data-dd-privacy': 'mask', data-hj-suppress: '', className: 'fs-mask' }
 *
 * @see module:React.useComponentPropOverrides
 * @memberof module:React
 */
const withComponentPropOverrides = (target, options = {}) => (WrappedComponent) => {
  const WithComponentPropOverrides = forwardRef((props, ref) => {
    const propOverrides = useComponentPropOverrides(target, props, options);
    return <WrappedComponent ref={ref} {...propOverrides} />;
  });
  WithComponentPropOverrides.displayName = `withComponentPropOverrides(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithComponentPropOverrides;
};

export default withComponentPropOverrides;
