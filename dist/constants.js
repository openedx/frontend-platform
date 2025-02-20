/** @constant */
export var APP_TOPIC = 'APP';
export var APP_PUBSUB_INITIALIZED = "".concat(APP_TOPIC, ".PUBSUB_INITIALIZED");

/**
 * Event published when the application initialization sequence has finished loading any dynamic
 * configuration setup in a custom config handler.
 *
 * @event
 */
export var APP_CONFIG_INITIALIZED = "".concat(APP_TOPIC, ".CONFIG_INITIALIZED");

/**
 * Event published when the application initialization sequence has finished determining the user's
 * authentication state, creating an authenticated API client, and executing auth handlers.
 *
 * @event
 */
export var APP_AUTH_INITIALIZED = "".concat(APP_TOPIC, ".AUTH_INITIALIZED");

/**
 * Event published when the application initialization sequence has finished initializing
 * internationalization and executing any i18n handlers.
 *
 * @event
 */
export var APP_I18N_INITIALIZED = "".concat(APP_TOPIC, ".I18N_INITIALIZED");

/**
 * Event published when the application initialization sequence has finished initializing the
 * logging service and executing any logging handlers.
 *
 * @event
 */
export var APP_LOGGING_INITIALIZED = "".concat(APP_TOPIC, ".LOGGING_INITIALIZED");

/**
 * Event published when the application initialization sequence has finished initializing the
 * analytics service and executing any analytics handlers.
 *
 * @event
 */
export var APP_ANALYTICS_INITIALIZED = "".concat(APP_TOPIC, ".ANALYTICS_INITIALIZED");

/**
 * Event published when the application initialization sequence has finished.  Applications should
 * subscribe to this event and start rendering the UI when it has fired.
 *
 * @event
 */
export var APP_READY = "".concat(APP_TOPIC, ".READY");

/**
 * Event published when the application initialization sequence has aborted.  This is frequently
 * used to show an error page when an initialization error has occurred.
 *
 * @see {@link module:React~ErrorPage}
 * @event
 */
export var APP_INIT_ERROR = "".concat(APP_TOPIC, ".INIT_ERROR");

/** @constant */
export var CONFIG_TOPIC = 'CONFIG';
export var CONFIG_CHANGED = "".concat(CONFIG_TOPIC, ".CHANGED");
//# sourceMappingURL=constants.js.map