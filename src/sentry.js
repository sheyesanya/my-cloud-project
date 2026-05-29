import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return; // skip in dev if not configured

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    release:     'brandcasta@1.0.0',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText:   false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate:   0.2,   // 20% of transactions
    replaysSessionSampleRate: 0.05,  // 5% of sessions
    replaysOnErrorSampleRate: 1.0,   // 100% on errors
    beforeSend(event) {
      // Strip sensitive data
      if (event.request?.cookies)  delete event.request.cookies;
      if (event.user?.email)        event.user.email = '[filtered]';
      return event;
    },
  });
}

export { Sentry };