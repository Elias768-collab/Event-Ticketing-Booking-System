
import {
  listMockEvents,
  getMockEvent,
  createMockBooking,
  payMockBooking,
} from "./mockData.js";

// The pages use these functions instead of accessing data directly.

export function listEvents(options = {}) {
  return listMockEvents(options);
}

export function getEvent(eventId) {
  return getMockEvent(eventId);
}

export function createBooking(details) {
  return createMockBooking(details);
}

export function pay(reference, outcome = "success") {
  return payMockBooking(reference, outcome);
}
