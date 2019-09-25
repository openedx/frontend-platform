import { configureLoggingService, NewRelicLoggingService } from '@edx/frontend-logging';

/* eslint-disable no-param-reassign */
export default async function logging(app) {
  // Default to NewRelicLoggingService if one was not provided.
  if (app.loggingService === undefined) {
    app.loggingService = NewRelicLoggingService;
  }
  configureLoggingService(app.loggingService);
}
