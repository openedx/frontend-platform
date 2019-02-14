import {
  FETCH_USER_ACCOUNT_BEGIN,
  FETCH_USER_ACCOUNT_SUCCESS,
  FETCH_USER_ACCOUNT_FAILURE,
} from '../actions/userAccount';

const initialState = {
  loading: false,
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
        error: null,
      };
    case FETCH_USER_ACCOUNT_SUCCESS:
      return {
        ...state,
        loading: false,
        ...action.payload.userAccount,
      };
    case FETCH_USER_ACCOUNT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

export default userAccount;
