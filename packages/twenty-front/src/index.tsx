import * as Sentry from '@sentry/react';
import ReactDOM from 'react-dom/client';

import '@emotion/react';

if (
  import.meta.env.VITE_SENTRY_DSN !== undefined &&
  import.meta.env.VITE_SENTRY_DSN !== ''
) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^\//],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

import { App } from '@/app/components/App';
import 'react-loading-skeleton/dist/skeleton.css';
import 'twenty-ui/style.css';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') ?? document.body,
);

root.render(<App />);
