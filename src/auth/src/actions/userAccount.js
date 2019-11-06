const FETCH_USER_ACCOUNT_BEGIN = 'FETCH_USER_ACCOUNT_BEGIN';
const FETCH_USER_ACCOUNT_SUCCESS = 'FETCH_USER_ACCOUNT_SUCCESS';
const FETCH_USER_ACCOUNT_FAILURE = 'FETCH_USER_ACCOUNT_FAILURE';

const fetchUserAccountBegin = () => ({
  type: FETCH_USER_ACCOUNT_BEGIN,
});

const fetchUserAccountSuccess = userAccount => ({
  type: FETCH_USER_ACCOUNT_SUCCESS,
  payload: { userAccount },
});

const fetchUserAccountFailure = error => ({
  type: FETCH_USER_ACCOUNT_FAILURE,
  payload: { error },
});

const fetchUserAccount = (userAccountApiService, username) => (
  (dispatch) => {
    dispatch(fetchUserAccountBegin(username));
    return userAccountApiService.getUserAccount(username)
      .then((userAccount) => {
        dispatch(fetchUserAccountSuccess(userAccount));
      })
      .catch((error) => {
        dispatch(fetchUserAccountFailure(error));
      });
  }
);

export {
  FETCH_USER_ACCOUNT_BEGIN,
  FETCH_USER_ACCOUNT_SUCCESS,
  FETCH_USER_ACCOUNT_FAILURE,
  fetchUserAccountBegin,
  fetchUserAccountSuccess,
  fetchUserAccountFailure,
  fetchUserAccount,
};
