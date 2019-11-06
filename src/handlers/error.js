import { logError } from '@edx/frontend-logging';

export default async function error(app) {
  logError(app.error);
}
