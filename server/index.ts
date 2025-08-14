import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";

import { config, validateCriticalSecrets, isDevelopment } from "./config";
import { errorHandler, notFoundHandler, setupGlobalErrorHandlers } from "./errorHandler";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Setup global error handlers first
setupGlobalErrorHandlers();

// Validate critical secrets before starting the server
validateCriticalSecrets();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const { path } = req;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}…`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 handler for unknown routes
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = config.PORT;
  server.listen(
    {
      port,
      host: isDevelopment ? "127.0.0.1" : "0.0.0.0",
    },
    () => {
      log(`🚀 Server running on port ${port} (${config.NODE_ENV})`);
      if (isDevelopment) {
        log(`📱 Frontend: http://localhost:${port}`);
        log(`🔗 API: http://localhost:${port}/api`);
      }
    },
  );
})();
