import React from 'react';
import { mount } from 'enzyme';

import ErrorBoundary from './ErrorBoundary';

import { logApiClientError } from '../logging';

jest.mock('../logging');

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // This is a gross hack to suppress error logs in the invalid parentSelector test
    jest.spyOn(console, 'error');
    global.console.error.mockImplementation(() => {});
  });

  afterEach(() => {
    global.console.error.mockRestore();
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

    expect(logApiClientError).toHaveBeenCalledTimes(1);
    expect(logApiClientError).toHaveBeenCalledWith('booyah', { stack: '\n    in ExplodingComponent\n    in ErrorBoundary (created by WrapperComponent)\n    in WrapperComponent' });
  });
});
