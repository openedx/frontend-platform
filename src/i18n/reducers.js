import { SET_LOCALE } from './actions';
import { getLocale } from './lib';

const getDefaultState = () => ({
  locale: getLocale(),
});

const reducer = (state = getDefaultState(), action) => {
  switch (action.type) {
    case SET_LOCALE:
      return {
        locale: action.payload.locale,
      };
    default:
      return state;
  }
};

export default reducer;
