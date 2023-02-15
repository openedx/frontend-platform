import {
  SET_THEME_VARIANT,
  SET_IS_THEME_LOADED,
} from './constants';

export function appThemeReducer(state, action) {
  switch (action.type) {
    case SET_THEME_VARIANT: {
      const requestedThemeVariant = action.payload;
      return {
        ...state,
        themeVariant: requestedThemeVariant,
      };
    }
    case SET_IS_THEME_LOADED: {
      const requestedIsThemeLoaded = action.payload;
      return {
        ...state,
        isThemeLoaded: requestedIsThemeLoaded,
      };
    }
    default:
      return state;
  }
}

const setAppThemeVariant = (payload) => ({
  type: SET_THEME_VARIANT,
  payload,
});

const setAppThemeLoaded = (payload) => ({
  type: SET_IS_THEME_LOADED,
  payload,
});

export const appThemeActions = {
  setAppThemeVariant,
  setAppThemeLoaded,
};
