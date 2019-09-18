import React from 'react';
import { createStore } from 'redux';
import { mount } from 'enzyme';
import { createBrowserHistory } from 'history';
import { configure as configureI18n } from '@edx/frontend-i18n';
import { env } from './handlers/configuration';
import AppProvider from './AppProvider';
import App from './App';

configureI18n(env, {
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
});

App.config = {};
App.history = createBrowserHistory();

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
