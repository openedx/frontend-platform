export default async function error(app) {
  app.loggingService.logError(app.error.message);
}
