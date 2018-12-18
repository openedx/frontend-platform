const FETCH_USER_PROFILE_BEGIN = 'FETCH_USER_PROFILE_BEGIN';
const FETCH_USER_PROFILE_SUCCESS = 'FETCH_USER_PROFILE_SUCCESS';
const FETCH_USER_PROFILE_FAILURE = 'FETCH_USER_PROFILE_FAILURE';


const fetchUserProfileBegin = () => ({
  type: FETCH_USER_PROFILE_BEGIN,
});

const fetchUserProfileSuccess = userProfile => ({
  type: FETCH_USER_PROFILE_SUCCESS,
  payload: { userProfile },
});

const fetchUserProfileFailure = error => ({
  type: FETCH_USER_PROFILE_FAILURE,
  payload: { error },
});

const fetchUserProfile = (apiClient, username) => (
  (dispatch) => {
    dispatch(fetchUserProfileBegin(username));
    return apiClient.getUserProfile(username)
      .then((userProfile) => {
        dispatch(fetchUserProfileSuccess(userProfile));
      })
      .catch((error) => {
        dispatch(fetchUserProfileFailure(error));
      });
  }
);

export {
  FETCH_USER_PROFILE_BEGIN,
  FETCH_USER_PROFILE_SUCCESS,
  FETCH_USER_PROFILE_FAILURE,
  fetchUserProfileBegin,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  fetchUserProfile,
};
