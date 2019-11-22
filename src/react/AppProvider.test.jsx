import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import AppProvider from './AppProvider';
import { initialize } from '../initialize';

jest.mock('../auth', () => ({
  configure: () => {},
  getAuthenticatedUser: () => null,
  fetchAuthenticatedUser: () => null,
  getAuthenticatedHttpClient: () => ({}),
  AUTHENTICATED_USER_CHANGED: 'user_changed',
}));

jest.mock('../analytics', () => ({
  configure: () => {},
  identifyAnonymousUser: jest.fn(),
  identifyAuthenticatedUser: jest.fn(),
}));

describe('AppProvider', () => {
  beforeEach(async () => {
    await initialize({
      loggingService: jest.fn(() => ({
        logError: jest.fn(),
        logInfo: jest.fn(),
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

  it('should render its children', () => {
    const component = (
      <AppProvider store={createStore(state => state)}>
        <div>Child One</div>
        <div>Child Two</div>
      </AppProvider>
    );

    const wrapper = mount(component);
    const list = wrapper.find('div');
    expect(list.length).toEqual(2);
    expect(list.at(0).text()).toEqual('Child One');
    expect(list.at(1).text()).toEqual('Child Two');

    const reduxProvider = wrapper.find('Provider');
    expect(reduxProvider.length).toEqual(1);
  });

  it('should skip redux Provider if not given a store', () => {
    const component = (
      <AppProvider>
        <div>Child One</div>
        <div>Child Two</div>
      </AppProvider>
    );

    const wrapper = mount(component);
    const list = wrapper.find('div');
    expect(list.length).toEqual(2);
    expect(list.at(0).text()).toEqual('Child One');
    expect(list.at(1).text()).toEqual('Child Two');

    const reduxProvider = wrapper.find('Provider');
    expect(reduxProvider.length).toEqual(0);
  });
});
