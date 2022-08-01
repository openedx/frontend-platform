import React from 'react';
import { mount } from 'enzyme';

import ErrorBoundary from './ErrorBoundary';
import { initialize } from '..';

describe('ErrorBoundary', () => {
  const logError = jest.fn();
  const logInfo = jest.fn();

  beforeEach(async () => {
    // This is a gross hack to suppress error logs in the invalid parentSelector test
    jest.spyOn(console, 'error');
    global.console.error.mockImplementation(() => {});

    jest.clearAllMocks();

    await initialize({
      loggingService: jest.fn(() => ({
        logError,
        logInfo,
      })),
      messages: {
        ar: {},
        'es-419': {},
        fr: {},
        'zh-cn': {},
        ca: {},
        he: {},
        id: {},
        'ko-kr': {},
        pl: {},
        'pt-br': {},
        ru: {},
        th: {},
        uk: {},
      },
    });
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

    expect(logError).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledWith(new Error('booyah'), { stack: '\n    in ExplodingComponent\n    in ErrorBoundary (created by WrapperComponent)\n    in WrapperComponent' });
  });
});
