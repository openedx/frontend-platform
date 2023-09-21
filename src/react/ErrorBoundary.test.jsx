import React from 'react';
import { mount } from 'enzyme';

import ErrorBoundary from './ErrorBoundary';
import ErrorPage from './ErrorPage';
import { initializeMockApp } from '..';

describe('ErrorBoundary', () => {
  let logError = jest.fn();

  beforeEach(async () => {
    // This is a gross hack to suppress error logs in the invalid parentSelector test
    jest.spyOn(console, 'error');
    global.console.error.mockImplementation(() => {});

    const { loggingService } = initializeMockApp();
    logError = loggingService.logError;
  });

  afterEach(() => {
    global.console.error.mockRestore();
    jest.clearAllMocks();
  });

  it('should render children if no error', () => {
    const component = (
      <ErrorBoundary>
        <div>Yay</div>
      </ErrorBoundary>
    );
    const wrapper = mount(component);

    const element = wrapper.find('div');
    expect(element.text()).toEqual('Yay');
  });

  it('should render ErrorPage if it has an error', () => {
    const ExplodingComponent = () => {
      throw new Error('booyah');
    };

    const component = (
      <ErrorBoundary>
        <ExplodingComponent />
      </ErrorBoundary>
    );

    mount(component);

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(
      new Error('booyah'),
      expect.objectContaining({
        stack: expect.stringContaining('ExplodingComponent'),
      }),
    );
  });
  it('should render the fallback component when an error occurs', () => {
    function FallbackComponent() {
      return <div>Oops, something went wrong!</div>;
    }
    function ComponentError() {
      throw new Error('An error occurred during the click event!');
    }
    const wrapper = mount(
      <ErrorBoundary fallbackComponent={<FallbackComponent />}>
        <ComponentError />
      </ErrorBoundary>,
    );
    expect(wrapper.contains(<FallbackComponent />)).toBe(true);
  });

  it('should render the ErrorPage fallbackComponent is null', () => {
    function ComponentError() {
      throw new Error('An error occurred during the click event!');
    }
    const wrapper = mount(
      <ErrorBoundary fallbackComponent={null}>
        <ComponentError />
      </ErrorBoundary>,
    );
    expect(wrapper.contains(<ErrorPage />)).toBe(true);
  });
});
