
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createApp } from "../src/http/app.js";
import { Router } from "../src/http/router.js";

let server;
let baseUrl;
let publicDir;
let temporaryDirectory;

test("HTTP application", async (t) => {
  temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "event-ticketing-")
  );

  publicDir = path.join(temporaryDirectory, "public");

  await mkdir(publicDir);

  await writeFile(
    path.join(publicDir, "index.html"),
    "<h1>Event Ticketing System</h1>"
  );

  await writeFile(
    path.join(temporaryDirectory, "secret.txt"),
    "This file must not be accessible."
  );

  const router = new Router();

  router.get("/api/events", () => ({
    status: 200,
    body: { events: [] },
  }));

  router.post("/api/bookings", ({ body }) => ({
    status: 201,
    body: { received: body },
  }));

  server = createServer(
    createApp({ router, publicDir })
  );

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;

  t.after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    await rm(temporaryDirectory, {
      recursive: true,
      force: true,
    });
  });

  await t.test("GET /health returns status ok", async () => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "ok",
    });
  });

  await t.test("serves the public index.html file", async () => {
    const response = await fetch(`${baseUrl}/`);

    assert.equal(response.status, 200);
    assert.match(
      response.headers.get("content-type"),
      /text\/html/
    );

    assert.equal(
      await response.text(),
      "<h1>Event Ticketing System</h1>"
    );
  });

  await t.test("unknown API routes return JSON 404", async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), {
      error: {
        code: "NOT_FOUND",
        message: "API route not found.",
      },
    });
  });

  await t.test("invalid JSON returns JSON 400", async () => {
    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{invalid json}",
    });

    assert.equal(response.status, 400);

    const result = await response.json();

    assert.equal(result.error.code, "INVALID_JSON");
    assert.equal(typeof result.error.message, "string");
  });

  await t.test("valid JSON reaches the route handler", async () => {
    const response = await fetch(`${baseUrl}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tickets: 2 }),
    });

    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), {
      received: { tickets: 2 },
    });
  });

  await t.test("prevents access outside the public directory", async () => {
    const response = await fetch(
        `${baseUrl}/%2e%2e%2fsecret.txt`
    );

    assert.equal(response.status, 403);

    const result = await response.json();

    assert.equal(result.error.code, "FORBIDDEN");
  });

  await t.test("does not expose internal server errors", async () => {
    const failingRouter = new Router();

    failingRouter.get("/api/failure", () => {
      throw new Error("Internal database password failure");
    });

    const failingServer = createServer(
      createApp({ router: failingRouter, publicDir })
    );

    await new Promise((resolve) => {
      failingServer.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = failingServer.address();

      const response = await fetch(
        `http://127.0.0.1:${address.port}/api/failure`
      );

      const result = await response.json();

      assert.equal(response.status, 500);
      assert.equal(
        result.error.message,
        "An unexpected server error occurred."
      );

      assert.equal(
        JSON.stringify(result).includes("password"),
        false
      );
    } finally {
      await new Promise((resolve, reject) => {
        failingServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });
});
