import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./utils/queryClient";
import "./stores/themeStore";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./App.css";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(async () => {
      const { ReactQueryDevtools } = await import(
        "@tanstack/react-query-devtools"
      );

      return { default: ReactQueryDevtools };
    })
  : null;

const queryClient = createQueryClient();

// Optional error monitoring: only loaded when a Sentry DSN is configured.
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
  void import("@sentry/react").then((Sentry) =>
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0,
    })
  );
}

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Render the app
createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {import.meta.env.PROD && <Analytics />}
        {ReactQueryDevtools ? (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        ) : (
          null
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
