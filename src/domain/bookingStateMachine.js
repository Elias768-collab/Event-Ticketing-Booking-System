
import { DomainError } from "./errors.js";

/**
 * The five valid booking state
 * All kept in one place
 */
export const BOOKING_STATES = Object.freeze({
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
  CHECKED_IN: "checked_in",
});

// Defines exactly which state changes permitted for bookings
const ALLOWED_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["checked_in", "refunded", "cancelled"],
  cancelled: [],
  refunded: [],
  checked_in: [],
};

export function canTransition(currentState, nextState) {
  return ALLOWED_TRANSITIONS[currentState]?.includes(nextState) ?? false;
}

export function assertTransition(currentState, nextState) {
  if (!canTransition(currentState, nextState)) {
    throw new DomainError(
      "INVALID_TRANSITION",
      `Cannot transition booking from "${currentState}" to "${nextState}".`
    );
  }

  return true;
}
