import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import UserAccountApiService from '../services/UserAccountApiService';
import {
  FETCH_USER_ACCOUNT_BEGIN,
  FETCH_USER_ACCOUNT_SUCCESS,
  FETCH_USER_ACCOUNT_FAILURE,
  fetchUserAccountBegin,
  fetchUserAccountSuccess,
  fetchUserAccountFailure,
  fetchUserAccount,
} from './userAccount';

const mockStore = configureMockStore([thunk]);
jest.mock('../services/UserAccountApiService');

describe('FETCH userAccount actions', () => {
  it('should create an action to begin user account fetch', () => {
    const expectedAction = {
      type: FETCH_USER_ACCOUNT_BEGIN,
    };
    expect(fetchUserAccountBegin()).toEqual(expectedAction);
  });

  it('should create an action to signal user account fetch success', () => {
    const userAccount = {
      username: 'test',
    };
    const expectedAction = {
      type: FETCH_USER_ACCOUNT_SUCCESS,
      payload: { userAccount },
    };
    expect(fetchUserAccountSuccess(userAccount)).toEqual(expectedAction);
  });

  it('should create an action to signal user account fetch failure', () => {
    const error = 'Test failure';
    const expectedAction = {
      type: FETCH_USER_ACCOUNT_FAILURE,
      payload: { error },
    };
    expect(fetchUserAccountFailure(error)).toEqual(expectedAction);
  });

  it('creates FETCH_USER_ACCOUNT_SUCCESS when fetching user account has been done', () => {
    const username = 'test-user';
    UserAccountApiService.mockImplementation(() => ({
      getUserAccount: user => (
        new Promise((resolve) => {
          resolve({ username: user });
        })
      ),
    }));

    const expectedActions = [
      { type: FETCH_USER_ACCOUNT_BEGIN },
      {
        type: FETCH_USER_ACCOUNT_SUCCESS,
        payload: {
          userAccount: {
            username,
          },
        },
      },
    ];
    const store = mockStore({ userAccount: {} });

    const userAccountApiService = new UserAccountApiService();
    return store.dispatch(fetchUserAccount(userAccountApiService, username)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates FETCH_USER_ACCOUNT_FAILURE when fetching user account has failed', () => {
    const username = 'test-user';
    const error = 'test-error';
    UserAccountApiService.mockImplementation(() => ({
      getUserAccount: () => (
        new Promise((resolve, reject) => {
          reject(error);
        })
      ),
    }));

    const expectedActions = [
      { type: FETCH_USER_ACCOUNT_BEGIN },
      {
        type: FETCH_USER_ACCOUNT_FAILURE,
        payload: {
          error: 'test-error',
        },
      },
    ];
    const store = mockStore({ userAccount: {} });

    const userAccountApiService = new UserAccountApiService();
    return store.dispatch(fetchUserAccount(userAccountApiService, username)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
