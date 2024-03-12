import React, { useState } from 'react';
import {
  render, waitFor, screen, fireEvent,
} from '@testing-library/react';
import PluggableComponent from '.';

const ToggleContentComponent = () => {
  const [showContent, setShowContent] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setShowContent((prev) => !prev)}>
        Toggle Content
      </button>
      {showContent && <div data-testid="toggle-content">Toggle On</div>}
    </div>
  );
};

describe('PluggableComponent', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('renders correctly', async () => {
    const handleClickMock = jest.fn();
    const props = {
      title: 'button title',
      handleClick: handleClickMock,
    };

    const { container } = render(
      <PluggableComponent
        id="pluggableComponent"
        as="any-mfe-plugins-test"
        {...props}
      >
        <h1>Hi this is the original component</h1>
      </PluggableComponent>,
    );

    await waitFor(() => {
      const buttonComponent = screen.getByTestId('button-test');
      expect(buttonComponent).toBeInTheDocument();
      expect(screen.getByText(props.title)).toBeInTheDocument();
      fireEvent.click(buttonComponent);
      expect(handleClickMock).toHaveBeenCalled();
      expect(container).toMatchSnapshot();
    });
  });

  test('loads children component when import is invalid', async () => {
    render(
      <PluggableComponent id="est-pluggable" as="invalid import">
        <div data-testid="plugin">Plugin Loaded</div>
      </PluggableComponent>,
    );

    await waitFor(() => {
      const defaultComponent = screen.getByTestId('plugin');
      expect(screen.getByText('Plugin Loaded')).toBeInTheDocument();
      expect(defaultComponent).toBeInTheDocument();
    });
  });

  test('loads children component when import is empty', async () => {
    render(
      <PluggableComponent
        id="test-pluggable"
        as=""
      >
        <div data-testid="plugin">Plugin Loaded</div>
      </PluggableComponent>,
    );

    await waitFor(() => {
      const defaultComponent = screen.getByTestId('plugin');
      expect(screen.getByText('Plugin Loaded')).toBeInTheDocument();
      expect(defaultComponent).toBeInTheDocument();
    });
  });

  test('returns null when do not have children and import is invalid', async () => {
    render(
      <PluggableComponent
        id="test-pluggable"
        as="invalid-module"
      />,
    );

    await waitFor(() => {
      expect(screen.queryByTestId('plugin')).not.toBeInTheDocument();
    });
  });

  test('updates component when props change', async () => {
    const { rerender } = render(
      <PluggableComponent
        id="test-pluggable"
        as="any-mfe-plugins-test"
        title="Testing title component"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Testing title component')).toBeInTheDocument();
    });

    rerender(
      <PluggableComponent
        id="test-pluggable"
        as="any-mfe-plugins-test"
        title="Testing a new title component"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Testing a new title component')).toBeInTheDocument();
    });
  }); 

  test('updates component when children change', async () => {
    const { getByText, getByTestId } = render(
      <PluggableComponent
        id="test-pluggable"
        as="default-children"
      >
        <ToggleContentComponent />
      </PluggableComponent>,
    );

    await waitFor(() => {
      const toggleContent = screen.queryByTestId('toggle-content');
      expect(toggleContent).not.toBeInTheDocument();
    });

    const toggleButton = getByText('Toggle Content');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const toggleContent = getByTestId('toggle-content');
      expect(toggleContent).toBeInTheDocument();
      expect(toggleContent).toHaveTextContent('Toggle On');
    });
  });

  test('renders loadingComponent while the plugin is loading', async () => {
    jest.mock('./utils', () => ({
      isPluginAvailable: jest.fn().mockImplementation(
        () => new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        }),
      ),
    }));

    await waitFor(() => {
      const { getByText } = render(
        <PluggableComponent
          id="test-pluggable"
          as="any-mfe-plugins-test"
          title="Test Pluggable"
          loadingComponent={<div>Loading...</div>}
        />,
      );
      expect(getByText('Loading...')).toBeInTheDocument();
    });
  });

  test('renders multiple plugins', async () => {
    const MockPluginComponent = () => <div data-testid="plugin-test">Mocked Plugin Component</div>;

    // Mock the dynamic import to resolve with the MockPluginComponent
    jest.mock('@node_modules/@openedx-plugins/any-mfe-plugins-test', () => MockPluginComponent, { virtual: true });

    const { getByTestId } = render(
      <PluggableComponent
        id="test-pluggable"
        as=""
        plugins={[{ id: 'plugin-test-id', name: 'any-mfe-plugins-test' }]}
      />,
    );

    await waitFor(() => {
      const pluginComponent = getByTestId('plugin-test');
      expect(pluginComponent).toBeInTheDocument();
      expect(pluginComponent).toHaveTextContent('Mocked Plugin Component');
    });
  });

  test('renders multiple plugins with prefix', async () => {
    const MockPluginComponent = () => <div data-testid="plugin-test">Mocked Plugin Component</div>;

    // Mock the dynamic import to resolve with the MockPluginComponent
    jest.mock('@node_modules/@openedx-plugins/any-mfe-plugins-test', () => MockPluginComponent, { virtual: true });

    const { getByTestId } = render(
      <PluggableComponent
        id="test-pluggable"
        as=""
        pluginsPrefix="any-mfe-plugins"
        plugins={[]}
      />,
    );

    await waitFor(() => {
      const pluginComponent = getByTestId('plugin-test');
      expect(pluginComponent).toBeInTheDocument();
      expect(pluginComponent).toHaveTextContent('Mocked Plugin Component');
    });
  });
});
