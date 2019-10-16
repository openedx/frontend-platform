import {
  identifyAuthenticatedUser,
  sendPageEvent,
} from '@edx/frontend-analytics';

export default async function beforeReady(app) {
  identifyAuthenticatedUser(app.authenticatedUser.userId);
  sendPageEvent();
}
