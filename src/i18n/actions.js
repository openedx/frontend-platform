export const SET_LOCALE = 'I18N__SET_LOCALE';

export const setLocale = locale => ({
  type: SET_LOCALE,
  payload: {
    locale,
  },
});
