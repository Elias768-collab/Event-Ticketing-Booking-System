
import test from "node:test";
import assert from "node:assert/strict";

import {
  BOOKING_STATES,
  canTransition,
  assertTransition,
} from "../src/domain/bookingStateMachine.js";

import { DomainError } from "../src/domain/errors.js";

test("allows every permitted booking transition", () => {
  const allowed = [
    ["pending", "paid"],
    ["pending", "cancelled"],
    ["paid", "checked_in"],
    ["paid", "refunded"],
    ["paid", "cancelled"],
  ];

  for (const [from, to] of allowed) {
    assert.equal(canTransition(from, to), true);
    assert.equal(assertTransition(from, to), true);
  }
});

test("rejects every illegal booking transition", () => {
  const states = Object.values(BOOKING_STATES);

  for (const from of states) {
    for (const to of states) {
      if (!canTransition(from, to)) {
        assert.throws(
          () => assertTransition(from, to),
          (error) =>
            error instanceof DomainError &&
            error.code === "INVALID_TRANSITION"
        );
      }
    }
  }
});

test("rejects unknown booking states", () => {
  assert.equal(canTransition("unknown", "paid"), false);

  assert.throws(
    () => assertTransition("unknown", "paid"),
    { code: "INVALID_TRANSITION" }
  );
});
