# frontend-platform

Take these:

frontend-base
frontend-auth
frontend-analytics
frontend-i18n
frontend-logging

And roll them into frontend-platform.

Base retains responsibility for coordinating dependency injection and initialization of the other four more fundamental libraries, as well as providing helpers (AppProvider) to do data injection for React applications.  It does this as a convenience to MFE developers, but they still don't have to use base and can use the libraries directly if they so choose.

auth, analytics, i18n, and logging do not directly reference each other.  They're configured with any dependencies they need.

Usage of the four other libraries is accomplished via:

Example: `import { logError } from 'frontend-platform/logging';`

Assuming the consuming app is using webpack, this allows us to continue to treeshake out any code that isn't explicitly imported, meaning that just because you have frontend-platform as a dependency, you aren't burdened by unused code in your actual build artifacts.

We will try to minimize usage of the App singleton (and/or get rid of it completely)

App.config will be replaced with:

`import { getConfig } from 'frontend-platform/config';`

App.apiClient will be replaced with:

`import { getApiClient } from 'frontend-platform/auth';`

Today, only frontend-logging allows a configurable implementation (NewRelicLoggingService).  You can imagine that the other three (auth, analytics, and i18n) could allow this too.  (Segment, reactt-intl, axios)

Each of the four libraries (auth, analytics, i18n, and logging) are conceptually responsible for validating their implementation.  i.e., frontend-logging is configured with NewRelicLoggingService and is responsible for proving that it is a valid logging service.  The other three do this implicitly by directly bundling and referencing their implementations.  This is fine for the foreseeable future.

Using logging as an example, the other three libraries that depend on it can then take for granted that they're receiving a valid implementation by default.  The code choosing the implementation is responsible for vetting the contract (frontend-base does this by delegating to frontend-logging) If someone weren't using frontend-base, then they're responsible for ensuring they're using valid implementations.

We want to minimize the usage of a singleton that necessitates the initialization of ALL our libraries.  This is better for testing, in that you can then configure only what you need for the test, rather than having to call App.initialize().

The component parts of the platform benefit from this because they can all be versioned together and we can be sure that they're internally cohesive.  Being in the same repo means we can easily verify integrity via running all the test suites together.

MFEs then depend on a particular version of frontend-platform.  Practically speaking, this means they will get their library implementations from frontend-platform as well.

Reusable components will have a peer dependency of frontend-platform.  That's it.  Depending on their usage of it, they can include as many major versions as possible.

We can draw a distinction in logging, analytics, auth, and i18n between implementation code and dependency injection/configuration code.  Today only logging enforces this explicitly.  Using "the platform" implies usage of the dependency injection/configuration, which doesn't mean you have to use the default implementations provided by the platform - they remain configurable.

Because we expect our libraries to settle down and cease to have as many breaking changes, upgrading frontend-platform shouldn't generally involve absorbing multiple unrelated breaking changes, and should become more stable over time.  Soon.
