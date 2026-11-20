
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Router } from "./router.js";
import { DomainError } from "../domain/errors.js";
import { createMemoryRepository } from "../repositories/memory.js";
import { createEventService } from "../services/eventService.js";
import { createBookingService } from "../services/bookingService.js";
import { createMockPaymentGateway } from "../lib/mockPaymentGateway.js";
import { registerEventRoutes } from "../routes/eventRoutes.js";
import { registerBookingRoutes } from "../routes/bookingRoutes.js";

const DEFAULT_PUBLIC_DIR = fileURLToPath(
  new URL("../../public/", import.meta.url)
);

const CONTENT_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

// Sends a JSON response with the appropraite HTTP status
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(JSON.stringify(data));
}

// Read and parse incoming JSON request data
async function readJsonBody(req) {
  const contentType = req.headers["content-type"] || "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  let rawBody = "";

  for await (const chunk of req) {
    rawBody += chunk;

    if (rawBody.length > 1_000_000) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      error.code = "PAYLOAD_TOO_LARGE";
      throw error;
    }
  }

  if (!rawBody.trim()) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    const error = new Error("Request body contains invalid JSON.");
    error.statusCode = 400;
    error.code = "INVALID_JSON";
    throw error;
  }
}

// Locate and serves files from public
async function serveStaticFile(req, res, publicDir, pathname) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return sendJson(res, 400, {
      error: {
        code: "INVALID_PATH",
        message: "The requested path is invalid.",
      },
    });
  }

  const requestedPath = decodedPath === "/"
    ? "/index.html"
    : decodedPath;

  const resolvedPath = path.resolve(
    publicDir,
    `.${requestedPath}`
  );

  const relativePath = path.relative(publicDir, resolvedPath);

  // Prevent access to files outside the public directory.
  if (
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    return sendJson(res, 403, {
      error: {
        code: "FORBIDDEN",
        message: "Access to this file is not allowed.",
      },
    });
  }

  try {
    const fileInfo = await stat(resolvedPath);

    if (!fileInfo.isFile()) {
      return sendJson(res, 404, {
        error: {
          code: "NOT_FOUND",
          message: "File not found.",
        },
      });
    }

    const content = await readFile(resolvedPath);
    const extension = path.extname(resolvedPath);

    res.writeHead(200, {
      "Content-Type":
        CONTENT_TYPES[extension] || "application/octet-stream",
    });

    res.end(req.method === "HEAD" ? undefined : content);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return sendJson(res, 404, {
        error: {
          code: "NOT_FOUND",
          message: "File not found.",
        },
      });
    }

    throw error;
  }
}

// Connect the router, request handling and error handling
export function createApp({
  router = new Router(),
  publicDir = DEFAULT_PUBLIC_DIR,
  repository = createMemoryRepository(),
  paymentGateway = createMockPaymentGateway(),
} = {}) {
  const eventService = createEventService(repository);
  const bookingService = createBookingService(
    repository,
    paymentGateway
  );

  registerEventRoutes(router, eventService);
  registerBookingRoutes(router, bookingService);

  router.get("/health", () => ({
    status: 200,
    body: { status: "ok" },
  }));

  const safePublicDir = path.resolve(publicDir);

  return async function app(req, res) {
    try {
      const url = new URL(req.url, "http://localhost");
      const pathname = url.pathname;

      if (
        pathname === "/health" ||
        pathname.startsWith("/api/") ||
        pathname === "/api"
        ) {
        // Find a matching route using the HTTP method and URL path.
        const matchedRoute = router.match(req.method, pathname);

        if (!matchedRoute) {
            return sendJson(res, 404, {
            error: {
                code: "NOT_FOUND",
                message: "API route not found.",
            },
            });
        }

        const body = await readJsonBody(req);

        const result = await matchedRoute.handler({
          req,
          params: matchedRoute.params,
          query: Object.fromEntries(url.searchParams.entries()),
          body,
        });;

        return sendJson(
            res,
            result?.status ?? 200,
            result?.body ?? {}
        );
       }

      if (req.method === "GET" || req.method === "HEAD") {
        return await serveStaticFile(
          req,
          res,
          safePublicDir,
          pathname
        );
      }

      return sendJson(res, 404, {
        error: {
          code: "NOT_FOUND",
          message: "Resource not found.",
        },
      });
    } catch (error) {

      const domainStatusCodes = {
        VALIDATION: 400,
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        SOLD_OUT: 409,
        INVALID_TRANSITION: 409,
        PAYMENT_DECLINED: 402,
        PAYMENT_ERROR: 502,
      };

      const statusCode =
        error.statusCode ||
        (error instanceof DomainError
          ? domainStatusCodes[error.code] ?? 400
          : 500);

      sendJson(res, statusCode, {
        error: {
          code: error.code || "INTERNAL_SERVER_ERROR",
          message:
            statusCode === 500
              ? "An unexpected server error occurred."
              : error.message,
        },
      });
    }
  };
}
