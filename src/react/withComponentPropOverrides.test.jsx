/* eslint-disable react/prop-types */
import React from 'react';
import { Route, Routes, MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import withComponentPropOverrides from './withComponentPropOverrides';
import AppContext from './AppContext';
import { getConfig } from '../config';

jest.mock('../auth');
jest.mock('../config');

const mockCustomComponentOnClick = jest.fn();
const mockcomponentPropOverridesConfig = {
  targets: {
    example: {
      'data-dd-privacy': 'mask', // `data-*` (Datadog example)
      'data-hj-suppress': '', // `data-*` (Hotjar example)
      className: 'fs-mask', // `className` (Fullstory example)
      style: {
        background: 'blue',
        color: 'white',
      },
      onClick: mockCustomComponentOnClick,
    },
    example2: {
      'data-dd-action-name': 'example name', // `data-*` (Datadog example)
    },
  },
};

function ExampleComponent(props) {
  return (
    <span data-testid="component-prop-overrides-element" {...props}>hello world</span>
  );
}

describe('withComponentPropOverrides', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getConfig.mockReturnValue({});
  });

  it.each([
    {
      MockExampleComponent: withComponentPropOverrides('example')(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: false,
      hasDefaultComponentPropOverridesApplied: true,
      hasSpecialComponentPropOverridesApplied: false,
    },
    {
      MockExampleComponent: withComponentPropOverrides('example', { allowedPropNames: ['className', 'style', 'onClick'] })(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: false,
      hasDefaultComponentPropOverridesApplied: true,
      hasSpecialComponentPropOverridesApplied: true,
    },
    {
      MockExampleComponent: withComponentPropOverrides('example')(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: true,
      hasDefaultComponentPropOverridesApplied: true,
      hasSpecialComponentPropOverridesApplied: false,
    },
    {
      MockExampleComponent: withComponentPropOverrides('example', { allowedPropNames: ['className', 'style', 'onClick'] })(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: true,
      hasDefaultComponentPropOverridesApplied: true,
      hasSpecialComponentPropOverridesApplied: true,
    },
    {
      MockExampleComponent: withComponentPropOverrides('invalid')(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: false,
      hasDefaultComponentPropOverridesApplied: false,
      hasSpecialComponentPropOverridesApplied: false,
    },
    {
      MockExampleComponent: withComponentPropOverrides(undefined)(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: false,
      hasDefaultComponentPropOverridesApplied: false,
      hasSpecialComponentPropOverridesApplied: false,
    },
    {
      MockExampleComponent: withComponentPropOverrides('')(ExampleComponent),
      hasComponentPropOverridesConfigured: true,
      exampleComponentHasOnClick: false,
      hasDefaultComponentPropOverridesApplied: false,
      hasSpecialComponentPropOverridesApplied: false,
    },
    {
      MockExampleComponent: withComponentPropOverrides('example')(ExampleComponent),
      hasComponentPropOverridesConfigured: false,
      exampleComponentHasOnClick: false,
      hasDefaultComponentPropOverridesApplied: false,
      hasSpecialComponentPropOverridesApplied: false,
    },
    {
      MockExampleComponent: withComponentPropOverrides('example')(ExampleComponent),
      hasComponentPropOverridesConfigured: false,
      exampleComponentHasOnClick: true,
      hasDefaultComponentPropOverridesApplied: false,
      hasSpecialComponentPropOverridesApplied: false,
    },
  ])('should return a component with the expected configured attributes/values, if any (%s)', async ({
    MockExampleComponent,
    hasComponentPropOverridesConfigured,
    exampleComponentHasOnClick,
    hasDefaultComponentPropOverridesApplied,
    hasSpecialComponentPropOverridesApplied,
  }) => {
    if (hasComponentPropOverridesConfigured) {
      getConfig.mockReturnValue({ componentPropOverrides: mockcomponentPropOverridesConfig });
    }
    const mockComponentOnClick = jest.fn();
    const baseProps = {
      className: 'existing',
      onClick: exampleComponentHasOnClick ? mockComponentOnClick : undefined,
      style: { borderBottom: '4px solid red' },
    };
    const App = (
      <AppContext.Provider value={{ config: getConfig() }}>
        <MemoryRouter initialEntries={['/example']}>
          <Routes>
            <Route path="/example" element={<MockExampleComponent {...baseProps} />} />
          </Routes>
        </MemoryRouter>
      </AppContext.Provider>
    );
    render(App);
    const element = screen.getByTestId('component-prop-overrides-element');
    expect(element).toBeInTheDocument();

    // verify base props
    if (hasDefaultComponentPropOverridesApplied) {
      expect(element).toHaveAttribute('data-dd-privacy', 'mask');
      expect(element).toHaveAttribute('data-hj-suppress', '');
      expect(element).toHaveClass('fs-mask');

      // verify opt-in props
      if (hasSpecialComponentPropOverridesApplied) {
        expect(element).toHaveClass('existing'); // should still have base className prop
        expect(element).toHaveStyle({ background: 'blue', color: 'white', borderBottom: '4px solid red' });
      }
    } else {
      expect(element).not.toHaveAttribute('data-dd-privacy');
      expect(element).not.toHaveAttribute('data-hj-suppress', '');
      expect(element).not.toHaveClass('fs-mask');
      expect(element).toHaveClass('existing'); // should still have base className prop
      expect(element).toHaveStyle({ borderBottom: '4px solid red' });
    }

    // simulate click event
    await userEvent.click(element);

    // verify onClick event
    if (exampleComponentHasOnClick) {
      await waitFor(() => {
        expect(mockComponentOnClick).toHaveBeenCalledTimes(1);
        expect(mockComponentOnClick).toHaveBeenCalledWith(expect.any(Object));
      });
    }
    if (hasSpecialComponentPropOverridesApplied) {
      expect(mockCustomComponentOnClick).toHaveBeenCalledTimes(1);
      expect(mockCustomComponentOnClick).toHaveBeenCalledWith(expect.any(Object));
    } else {
      expect(mockCustomComponentOnClick).not.toHaveBeenCalled();
    }
  });
});
