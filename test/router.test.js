
import test from "node:test";
import assert from "node:assert/strict";

import { Router } from "../src/http/router.js";

test("matches an exact route", () => {
  const router = new Router();
  const handler = () => {};

  router.get("/health", handler);

  const result = router.match("GET", "/health");

  assert.equal(result.handler, handler);
  assert.deepEqual(result.params, {});
});

test("extracts route parameters", () => {
  const router = new Router();
  const handler = () => {};

  router.get("/api/bookings/:reference", handler);

  const result = router.match("GET", "/api/bookings/ABC123");

  assert.equal(result.handler, handler);
  assert.deepEqual(result.params, {
    reference: "ABC123",
  });
});

test("does not match a different HTTP method", () => {
  const router = new Router();

  router.get("/health", () => {});

  assert.equal(router.match("POST", "/health"), null);
});

test("does not match routes with different segment lengths", () => {
  const router = new Router();

  router.get("/api/bookings/:reference", () => {});

  assert.equal(router.match("GET", "/api/bookings"), null);
  assert.equal(router.match("GET", "/api/bookings/ABC123/pay"), null);
});

test("returns null for unknown routes", () => {
  const router = new Router();

  router.get("/health", () => {});

  assert.equal(router.match("GET", "/unknown"), null);
});

test("supports POST routes", () => {
  const router = new Router();
  const handler = () => {};

  router.post("/api/bookings", handler);

  const result = router.match("POST", "/api/bookings");

  assert.equal(result.handler, handler);
});
