import React, { useState, useEffect, useRef } from 'react';
import loadable from '@loadable/component';
import PropTypes from 'prop-types';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { isPluginAvailable } from './utils';
import MultiplePlugins from './MultiplePlugins';

/**
 * PluggableComponent - A component that allows dynamic loading and replacement of child components.
 *
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to be passed to the plugin component
 * @param {React.ReactNode} props.loadingComponent - Component to be rendered while the plugin is loading
 * @param {string} props.as - String indicating the module to import dynamically
 * @param {string} props.id - Identifier for the plugin
 * @param {object} props.pluggableComponentProps - Additional props to be passed to the dynamically loaded component
 * @param {string} props.pluginsPrefix - Prefix used to identify plugins. This is used without the 'plugins' prop.
 * @param {Array<Object>} props.plugins -
  *  An array of plugin configurations.
  *  Each configuration is an object that may include plugin-specific properties.
 * @param {object} props.containerPluginsProps -
  * Props to be spread on the container that wraps multiple plugin components.
  * Useful for passing classNames or styles for layout.
 * @returns {React.ReactNode} - Rendered component
 */
const PluggableComponent = ({
  children,
  loadingComponent,
  as,
  id,
  pluginsPrefix,
  plugins,
  containerPluginsProps,
  ...pluggableComponentProps
}) => {
  const [newComponent, setNewComponent] = useState(children || null);
  const loadedComponentRef = useRef(null);
  const [isLoadingComponent, setIsLoadingComponent] = useState(false);
  const hasConfigForMultiplePlugins = pluginsPrefix || plugins.length;

  useEffect(() => {
    const loadPluginComponent = async () => {
      setIsLoadingComponent(true);

      try {
        const hasModuleInstalled = await isPluginAvailable(as);

        if (hasModuleInstalled) {
          const PluginComponent = loadable(() => import(`@node_modules/@openedx-plugins/${as}`));

          const component = children ? (
            <PluginComponent key={id} {...pluggableComponentProps}>
              {children}
            </PluginComponent>
          ) : (
            <PluginComponent key={id} {...pluggableComponentProps} />
          );

          setNewComponent(component);
          loadedComponentRef.current = true;
        }
      } catch (error) {
        console.error(`Failed to load plugin ${as}:`, error);
      } finally {
        setIsLoadingComponent(false);
      }
    };

    const hasNoPlugins = !pluginsPrefix && !plugins.length;

    if (hasNoPlugins) {
      loadPluginComponent();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, as]);

  useEffect(() => {
    if (newComponent && children && loadedComponentRef.current) {
      const updatedComponent = React.cloneElement(newComponent, pluggableComponentProps, children);
      setNewComponent(updatedComponent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  useDeepCompareEffect(() => {
    if (newComponent && loadedComponentRef.current) {
      const updatedComponent = React.cloneElement(newComponent, pluggableComponentProps, children);
      setNewComponent(updatedComponent);
    }
  }, [pluggableComponentProps]);

  if (hasConfigForMultiplePlugins) {
    return (
      <MultiplePlugins
        prefix={pluginsPrefix}
        {...{
          plugins,
          pluggableComponentProps,
          loadingComponent,
          containerPluginsProps,
        }}
      />
    );
  }

  if (isLoadingComponent && loadingComponent) {
    return loadingComponent;
  }

  return newComponent;
};

PluggableComponent.defaultProps = {
  loadingComponent: null,
  plugins: [],
  pluginsPrefix: '',
  containerPluginsProps: {},
  children: undefined,
  as: '',
  id: '',
};

PluggableComponent.propTypes = {
  children: PropTypes.node,
  loadingComponent: PropTypes.node,
  as: PropTypes.string,
  id: PropTypes.string,
  pluginsPrefix: PropTypes.string,
  containerPluginsProps: PropTypes.shape({}),
  plugins: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  })),
};

export default PluggableComponent;
