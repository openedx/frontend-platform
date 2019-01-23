const FETCH_USER_ACCOUNT_BEGIN = 'FETCH_USER_ACCOUNT_BEGIN';
const FETCH_USER_ACCOUNT_SUCCESS = 'FETCH_USER_ACCOUNT_SUCCESS';
const FETCH_USER_ACCOUNT_FAILURE = 'FETCH_USER_ACCOUNT_FAILURE';
const SAVE_USER_ACCOUNT_BEGIN = 'SAVE_USER_ACCOUNT_BEGIN';
const SAVE_USER_ACCOUNT_SUCCESS = 'SAVE_USER_ACCOUNT_SUCCESS';
const SAVE_USER_ACCOUNT_FAILURE = 'SAVE_USER_ACCOUNT_FAILURE';


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

const saveUserAccountBegin = () => ({
  type: SAVE_USER_ACCOUNT_BEGIN,
});

const saveUserAccountSuccess = userAccount => ({
  type: SAVE_USER_ACCOUNT_SUCCESS,
  payload: { userAccount },
});

const saveUserAccountFailure = error => ({
  type: SAVE_USER_ACCOUNT_FAILURE,
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

const saveUserAccount = (userAccountApiService, username, userAccountState) => (
  (dispatch) => {
    dispatch(saveUserAccountBegin());
    return userAccountApiService.saveUserAccount(username, userAccountState)
      .then((userAccount) => {
        dispatch(saveUserAccountSuccess(userAccount));
      })
      .catch((error) => {
        dispatch(saveUserAccountFailure(error));
      });
  }
);

export {
  FETCH_USER_ACCOUNT_BEGIN,
  FETCH_USER_ACCOUNT_SUCCESS,
  FETCH_USER_ACCOUNT_FAILURE,
  SAVE_USER_ACCOUNT_BEGIN,
  SAVE_USER_ACCOUNT_SUCCESS,
  SAVE_USER_ACCOUNT_FAILURE,
  fetchUserAccountBegin,
  fetchUserAccountSuccess,
  fetchUserAccountFailure,
  fetchUserAccount,
  saveUserAccountBegin,
  saveUserAccountSuccess,
  saveUserAccountFailure,
  saveUserAccount,
};
