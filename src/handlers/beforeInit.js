/* eslint-disable no-param-reassign */
import { createBrowserHistory } from 'history';

export default async function beforeInit(app) {
  app.history = createBrowserHistory();
}
