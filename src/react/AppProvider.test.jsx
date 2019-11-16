import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { configure as configureI18n } from '../i18n';
import AppProvider from './AppProvider';

configureI18n({
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
  configService: {
    getConfig: () => ({
      LANGUAGE_PREFERENCE_COOKIE_NAME: process.env.LANGUAGE_PREFERENCE_COOKIE_NAME,
      ENVIRONMENT: process.env.NODE_ENV,
    }),
  },
  loggingService: { logError: jest.fn() },
});

describe('AppProvider', () => {
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
