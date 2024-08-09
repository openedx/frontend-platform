import { useEffect } from 'react';
import { subscribe, unsubscribe } from '../pubSub';
import { sendTrackEvent } from '../analytics';
import { getConfig } from '../config';

/**
 * A React hook that allows functional components to subscribe to application events.  This should
 * be used sparingly - for the most part, Context should be used higher-up in the application to
 * provide necessary data to a given component, rather than utilizing a non-React-like Pub/Sub
 * mechanism.
 *
 * @param {string} type
 * @param {function} callback
 *
 * @memberof module:React
 */
export const useAppEvent = (type, callback) => {
  useEffect(() => {
    const subscriptionToken = subscribe(type, callback);

    return function cleanup() {
      unsubscribe(subscriptionToken);
    };
  }, [callback, type]);
};

/**
 * A React hook that tracks user's preferred color scheme (light or dark) and sends respective
 * event to the tracking service.
 *
 * @memberof module:React
 */
export const useTrackColorSchemeChoice = () => {
  useEffect(() => {
    const trackColorSchemeChoice = ({ matches }) => {
      const preferredColorScheme = matches ? 'dark' : 'light';
      sendTrackEvent('openedx.ui.frontend-platform.prefers-color-scheme.selected', { preferredColorScheme });
    };
    const colorSchemeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (colorSchemeQuery) {
      // send user's initial choice
      trackColorSchemeChoice(colorSchemeQuery);
      colorSchemeQuery.addEventListener('change', trackColorSchemeChoice);
    }
    return () => {
      if (colorSchemeQuery) {
        colorSchemeQuery.removeEventListener('change', trackColorSchemeChoice);
      }
    };
  }, []);
};

/**
 * @typedef {object} ComponentPropOverride
 * @property {string|boolean|Record<string, any>|Function} [key] - The custom prop value.
 */

/**
 * @typedef {object} ComponentPropOverrides
 * @property {Record<string, ComponentPropOverride>} targets - A mapping of component targets to custom props.
 */

/**
 * @typedef {object} AppConfigWithComponentPropOverrides
 * @property {ComponentPropOverrides} componentPropOverrides - The component prop overrides configuration.
 */

/**
 * @typedef {object} ComponentPropOverridesOptions
 * @property {string[]} [allowedPropNames=["className"]] - The list of prop names allowed to be overridden.
 * @property {boolean} [allowsDataAttributes=true] - Whether to allow `data-*` attributes to be applied.
 */

/**
 * A React hook that processes the given `target` to extend/merge component props
 * with any corresponding attributes/values based on configuration.
 *
 * This hook looks up the specified `target` in the `componentPropOverrides` configuration,
 * and if a match is found, it merges the component's props with the mapped attributes/values
 * per the configured component targets.
 *
 * @param {string} target - The component target used to identify custom props per configuration.
 * @param {Record<string, any>} props - The original props object passed to the component.
 * @param {ComponentPropOverridesOptions} [options] - Optional configuration for the hook.
 * @returns {Record<string, any>} An updated props object with custom props merged in.
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
 * // and calling the hook as follows:
 * const propOverrides = useComponentPropOverrides('example', { otherProp: 'value' });
 *
 * // The resulting `propOverrides` will be:
 * { otherProp: 'value', 'data-dd-privacy': 'mask', data-hj-suppress: '', className: 'fs-mask' }
 *
 * @memberof module:React
 * @see module:React.withComponentPropOverrides
 */
export function useComponentPropOverrides(target, props, options = {}) {
  /** @type {AppConfigWithComponentPropOverrides} */
  const { componentPropOverrides } = getConfig();
  const propOverridesForTarget = componentPropOverrides?.targets?.[target];
  if (!target || !propOverridesForTarget) {
    return props;
  }
  const overrideOptions = {
    // Allow for custom prop overrides to be applied to the component. These are
    // separate from any `data-*` attributes, which are always supported.
    allowedPropNames: ['className'],
    // Allow for any `data-*` attributes to be applied to the component.
    allowsDataAttributes: true,
    ...options,
  };

  const updatedProps = { ...props };
  // Apply the configured attributes/values/classes for the matched target
  Object.entries(propOverridesForTarget).forEach(([attributeName, attributeValue]) => {
    const isAllowedPropName = !!overrideOptions.allowedPropNames?.includes(attributeName);
    const isDataAttribute = !!overrideOptions.allowsDataAttributes && attributeName.startsWith('data-');
    const isAllowedPropOverride = isAllowedPropName || isDataAttribute;
    if (!isAllowedPropOverride) {
      // Skip applying the override prop if it's not allowed.
      return;
    }

    // Parse attributeValue as empty string if not provided, or falsey value is given (e.g., `undefined`).
    let transformedAttributeValue = !attributeValue ? '' : attributeValue;
    if (attributeName === 'className') {
      // Append the `className` to the existing `className` prop value (if any)
      transformedAttributeValue = [updatedProps.className, attributeValue].join(' ').trim();
    } else if (attributeName === 'style' && typeof attributeValue === 'object') {
      // Merge the `style` object with the existing `style` prop object (if any)
      transformedAttributeValue = { ...updatedProps.style, ...attributeValue };
    } else if (typeof attributeValue === 'function') {
      // Merge the function with the existing prop's function
      const oldFn = updatedProps[attributeName];
      transformedAttributeValue = oldFn ? (...args) => {
        oldFn(...args);
        attributeValue(...args);
      } : attributeValue;
    }

    // Update the props with the transformed attribute value
    updatedProps[attributeName] = transformedAttributeValue;
  });
  return updatedProps;
}
