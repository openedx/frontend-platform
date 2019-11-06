import {
  FETCH_USER_ACCOUNT_BEGIN,
  FETCH_USER_ACCOUNT_SUCCESS,
  FETCH_USER_ACCOUNT_FAILURE,
} from '../actions/userAccount';
import reducer from './userAccount';

describe('userAccount reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      loading: false,
      loaded: false,
      error: null,
      username: null,
      email: null,
      bio: null,
      name: null,
      country: null,
      socialLinks: null,
      profileImage: {
        imageUrlMedium: null,
        imageUrlLarge: null,
      },
      levelOfEducation: null,
    });
  });

  it('should handle FETCH_USER_ACCOUNT_BEGIN', () => {
    expect(reducer({}, {
      type: FETCH_USER_ACCOUNT_BEGIN,
    })).toEqual({
      loading: true,
      loaded: false,
      error: null,
    });
  });

  it('should handle FETCH_USER_ACCOUNT_SUCCESS', () => {
    const userAccount = {
      email: 'test',
      username: 'test',
    };
    expect(reducer({}, {
      type: FETCH_USER_ACCOUNT_SUCCESS,
      payload: { userAccount },
    })).toEqual({
      loading: false,
      loaded: true,
      ...userAccount,
    });
  });

  it('should handle FETCH_USER_ACCOUNT_FAILURE', () => {
    const error = 'Test failure';
    expect(reducer({}, {
      type: FETCH_USER_ACCOUNT_FAILURE,
      payload: { error },
    })).toEqual({
      loading: false,
      loaded: false,
      error,
    });
  });
});
