import {
  identifyAuthenticatedUser,
  identifyAnonymousUser,
  sendPageEvent,
} from '../../analytics';

export default async function beforeReady(app) {
  if (app.authenticatedUser === null) {
    identifyAnonymousUser();
  } else {
    identifyAuthenticatedUser(app.authenticatedUser.userId);
  }
  sendPageEvent();
}
