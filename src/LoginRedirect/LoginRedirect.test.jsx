import React from 'react';
import { mount } from 'enzyme';

import LoginRedirect from './index';

const mockLogin = jest.fn();

describe('LoginRedirect', () => {
  it('calls authenticatedAPIClient.login', () => {
    const redirect = 'https://example.com';
    mount((
      <LoginRedirect
        authenticatedAPIClient={{
          login: mockLogin,
        }}
        redirect={redirect}
      />
    ));
    expect(mockLogin).toHaveBeenCalledWith(redirect);
  });
});
