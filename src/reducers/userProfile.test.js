import {
  FETCH_USER_PROFILE_BEGIN,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
} from '../actions/userProfile';
import reducer from './userProfile';

describe('userProfile reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      loading: false,
      error: null,
      email: null,
      username: null,
      userProfileImageUrl: null,
    });
  });

  it('should handle FETCH_USER_PROFILE_BEGIN', () => {
    expect(reducer({}, {
      type: FETCH_USER_PROFILE_BEGIN,
    })).toEqual({
      loading: true,
      error: null,
    });
  });

  it('should handle FETCH_USER_PROFILE_SUCCESS', () => {
    const userProfile = {
      email: 'test',
      username: 'test',
      profile_image: { image_url_medium: 'test' },
    };
    expect(reducer({}, {
      type: FETCH_USER_PROFILE_SUCCESS,
      payload: { userProfile },
    })).toEqual({
      loading: false,
      email: 'test',
      username: userProfile.username,
      userProfileImageUrl: userProfile.profile_image.image_url_medium,
    });
  });

  it('should handle FETCH_USER_PROFILE_FAILURE', () => {
    const error = 'Test failure';
    expect(reducer({}, {
      type: FETCH_USER_PROFILE_FAILURE,
      payload: { error },
    })).toEqual({
      loading: false,
      error,
      email: null,
      username: null,
      userProfileImageUrl: null,
    });
  });
});
