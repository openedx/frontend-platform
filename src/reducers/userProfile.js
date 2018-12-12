import {
  FETCH_USER_PROFILE_BEGIN,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
} from '../actions/userProfile';

const initialState = {
  loading: false,
  error: null,
  email: null,
  username: null,
  userProfileImageUrl: null,
};

const userProfile = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_PROFILE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_USER_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        email: action.payload.userProfile.email,
        username: action.payload.userProfile.username,
        userProfileImageUrl: action.payload.userProfile.profile_image.image_url_medium,
      };
    case FETCH_USER_PROFILE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        email: null,
        username: null,
        userProfileImageUrl: null,
      };
    default:
      return state;
  }
};

export default userProfile;
