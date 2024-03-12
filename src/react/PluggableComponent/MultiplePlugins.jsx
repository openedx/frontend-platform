import React, { useState, useEffect, useRef } from 'react';
import loadable from '@loadable/component';
import useDeepCompareEffect from 'use-deep-compare-effect';
import PropTypes from 'prop-types';

import { isPluginAvailable, getPluginsByPrefix } from './utils';

const MultiplePlugins = ({
  plugins,
  pluggableComponentProps,
  prefix,
  loadingComponent,
  containerPluginsProps,
}) => {
  const [pluginComponents, setPluginComponents] = useState({});
  const loadedAllPluginsRef = useRef(null);

  useEffect(() => {
    const loadPlugins = (pluginsList) => {
      pluginsList.forEach((plugin, index) => {
        // Initially set the loading component for each plugin
        setPluginComponents(previousPluginComponents => ({
          ...previousPluginComponents,
          [plugin.id]: loadingComponent || null,
        }));

        const loadPlugin = async () => {
          try {
            const hasModuleInstalled = await isPluginAvailable(plugin.name);
            if (hasModuleInstalled) {
              const PluginComponent = loadable(() => import(`@node_modules/@openedx-plugins/${plugin.name}`));
              setPluginComponents(previousPluginComponents => ({
                ...previousPluginComponents,
                [plugin.id]: (
                  <PluginComponent {...pluggableComponentProps} />
                ),
              }));
            }
          } catch (error) {
            console.error(`Failed to load plugin ${plugin.name}:`, error);
            // Set to null in case of an error
            setPluginComponents(previousPluginComponents => ({
              ...previousPluginComponents,
              [plugin.id]: null,
            }));
          } finally {
            const isLastPlugin = index === pluginsList.length - 1;
            if (isLastPlugin) {
              loadedAllPluginsRef.current = true;
            }
          }
        };

        loadPlugin();
      });
    };

    const pluginsToLoad = prefix ? getPluginsByPrefix(prefix) : plugins;

    if (pluginsToLoad.length) {
      loadPlugins(pluginsToLoad);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDeepCompareEffect(() => {
    const updatePluginsWithNewProps = () => {
      const updatedComponents = Object.keys(pluginComponents).reduce((previousPluginComponents, pluginKey) => {
        const PluginComponent = pluginComponents[pluginKey];
        // Check if the component is a valid React element and not a loading or error state
        if (React.isValidElement(PluginComponent)) {
          const UpdatedComponent = React.cloneElement(PluginComponent, pluggableComponentProps);
          return {
            ...previousPluginComponents,
            [pluginKey]: UpdatedComponent,
          };
        }
        return previousPluginComponents;
      }, {});

      setPluginComponents(updatedComponents);
    };

    if (loadedAllPluginsRef.current) {
      updatePluginsWithNewProps();
    }
  }, [pluggableComponentProps]);

  return (
    <div {...containerPluginsProps}>
      {Object.entries(pluginComponents).map(([pluginKey, Component]) => (
        <React.Fragment key={pluginKey}>
          {Component}
        </React.Fragment>
      ))}
    </div>
  );
};

MultiplePlugins.defaultProps = {
  plugins: [],
  pluggableComponentProps: {},
  prefix: '',
  loadingComponent: null,
  containerPluginsProps: {},
};

MultiplePlugins.propTypes = {
  plugins: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  })),
  pluggableComponentProps: PropTypes.shape({}),
  prefix: PropTypes.string,
  loadingComponent: PropTypes.node,
  containerPluginsProps: PropTypes.shape({}),
};

export default MultiplePlugins;
