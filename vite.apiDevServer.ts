import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Serves the Vercel functions in /api during `vite dev`, so features that
 * use them (subscriptions, previews, RSS…) work locally. In emulator mode
 * the functions talk to the Firebase emulators, and without Gmail
 * credentials emails are logged instead of sent.
 */
export const apiDevServer = (mode: string): Plugin => ({
  name: "api-dev-server",
  apply: "serve",
  configureServer(server) {
    if (mode === "emulators") {
      process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
      process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
      process.env.FIREBASE_PROJECT_ID ??= "demo-blogger";
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      process.env.EMAIL_TRANSPORT ??= "json";
    }

    server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      const aliases: Record<string, string> = { "/rss.xml": "rss", "/sitemap.xml": "sitemap", "/robots.txt": "robots" };
      const match = aliases[url.pathname]
        ? [url.pathname, aliases[url.pathname]]
        : url.pathname.match(/^\/api\/([a-z0-9-]+)$/);
      if (!match) return next();

      try {
        const module = (await server.ssrLoadModule(`/api/${match[1]}.ts`)) as Record<
          string,
          ((request: Request) => Response | Promise<Response>) | undefined
        >;
        const handler = module[req.method ?? "GET"];
        if (!handler) {
          res.statusCode = 405;
          return res.end();
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        const host = req.headers.host ?? "localhost";
        const request = new Request(`http://${host}${req.url}`, {
          method: req.method,
          headers: Object.entries(req.headers).flatMap(([key, value]) =>
            value === undefined ? [] : [[key, Array.isArray(value) ? value.join(", ") : value] as [string, string]]
          ),
          body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
        });

        const response = await handler(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      } catch (error) {
        if ((error as { code?: string }).code === "ERR_LOAD_URL") {
          res.statusCode = 404;
          return res.end();
        }
        server.config.logger.error(`[api] ${(error as Error).stack ?? error}`);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal error" }));
      }
    });
  },
});
