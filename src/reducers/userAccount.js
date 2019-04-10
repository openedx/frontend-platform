import {
  FETCH_USER_ACCOUNT_BEGIN,
  FETCH_USER_ACCOUNT_SUCCESS,
  FETCH_USER_ACCOUNT_FAILURE,
} from '../actions/userAccount';

const initialState = {
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
};

const userAccount = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_ACCOUNT_BEGIN:
      return {
        ...state,
        loading: true,
        loaded: false,
        error: null,
      };
    case FETCH_USER_ACCOUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        ...action.payload.userAccount,
      };
    case FETCH_USER_ACCOUNT_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default userAccount;
