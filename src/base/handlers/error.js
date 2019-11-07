import { logError } from '../../logging';

export default async function error(app) {
  logError(app.error);
}
