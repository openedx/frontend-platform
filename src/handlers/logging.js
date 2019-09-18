import { configureLoggingService } from '@edx/frontend-logging';

export default async function logging(app) {
  configureLoggingService(app.loggingService);
}
