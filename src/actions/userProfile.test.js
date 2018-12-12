import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import applyMockAuthInterface from '../AuthenticatedAPIClient/tests/mockAuthInterface';
import getAuthenticatedAPIClient from '../AuthenticatedAPIClient';
import {
  FETCH_USER_PROFILE_BEGIN,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
  fetchUserProfileBegin,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  fetchUserProfile,
} from './userProfile';

const mockStore = configureMockStore([thunk]);
const authConfig = {
  authBaseUrl: process.env.LMS_BASE_URL,
};

describe('actions', () => {
  it('should create an action to begin user profile fetch', () => {
    const expectedAction = {
      type: FETCH_USER_PROFILE_BEGIN,
    };
    expect(fetchUserProfileBegin()).toEqual(expectedAction);
  });

  it('should create an action to signal user profile fetch success', () => {
    const userProfile = {
      username: 'test',
      userProfileImageUrl: 'test',
    };
    const expectedAction = {
      type: FETCH_USER_PROFILE_SUCCESS,
      payload: { userProfile },
    };
    expect(fetchUserProfileSuccess(userProfile)).toEqual(expectedAction);
  });

  it('should create an action to signal user profile fetch failure', () => {
    const error = 'Test failure';
    const expectedAction = {
      type: FETCH_USER_PROFILE_FAILURE,
      payload: { error },
    };
    expect(fetchUserProfileFailure(error)).toEqual(expectedAction);
  });

  it('creates FETCH_USER_PROFILE_SUCCESS when fetching user profile has been done', () => {
    const username = 'test-user';
    const client = getAuthenticatedAPIClient(authConfig);
    applyMockAuthInterface(client);

    const expectedActions = [
      { type: FETCH_USER_PROFILE_BEGIN },
      {
        type: FETCH_USER_PROFILE_SUCCESS,
        payload: {
          userProfile: {
            username,
            profile_image: {
              image_url_medium: 'test-image-url',
            },
          },
        },
      },
    ];
    const store = mockStore({ userProfile: {} });

    return store.dispatch(fetchUserProfile(client, username)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates FETCH_USER_PROFILE_FAILURE when fetching user profile has failed', () => {
    const username = 'test-user';
    const error = 'test-error';
    const client = getAuthenticatedAPIClient(authConfig);
    client.getUserProfile = jest.fn();
    client.getUserProfile.mockReturnValueOnce(new Promise((resolve, reject) => {
      reject(error);
    }));

    const expectedActions = [
      { type: FETCH_USER_PROFILE_BEGIN },
      {
        type: FETCH_USER_PROFILE_FAILURE,
        payload: {
          error: 'test-error',
        },
      },
    ];
    const store = mockStore({ userProfile: {} });

    return store.dispatch(fetchUserProfile(client, username)).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
