import { DomainError } from "../domain/errors.js";
import {
  createStore,
  createEvent as createDomainEvent,
  addTier as addDomainTier,
  publishEvent as publishDomainEvent,
  listEventSummaries,
  createPendingBooking as createDomainPendingBooking,
} from "../domain/inventory.js";

// Create an isolated in-memory repository.
export function createMemoryRepository() {
  const store = createStore();

  return {
    // -------------------------
    // Events
    // -------------------------

    async createEvent(details) {
      return createDomainEvent(store, details);
    },

    async findEventById(eventId) {
      return store.events.get(eventId) ?? null;
    },

    async listEvents() {
      return [...store.events.values()];
    },

    async publishEvent(eventId) {
      return publishDomainEvent(store, eventId);
    },

    async listEventSummaries(options = {}) {
      return listEventSummaries(store, options);
    },

    // -------------------------
    // Ticket tiers
    // -------------------------

    async createTier(eventId, details) {
      return addDomainTier(store, eventId, details);
    },

    async findTierById(tierId) {
      return store.tiers.get(tierId) ?? null;
    },

    async listTiersByEventId(eventId) {
      return [...store.tiers.values()].filter(
        (tier) => tier.eventId === eventId
      );
    },

    // -------------------------
    // Bookings
    // -------------------------

    async createBooking(booking) {
      store.bookings.set(booking.id, booking);
      store.bookingsByReference.set(booking.reference, booking.id);

      return booking;
    },

    async createPendingBooking(tierId, quantity, userId) {
          return createDomainPendingBooking(store, tierId, quantity, userId);
        },

    async cancelPendingBooking(bookingId) {
      const booking = store.bookings.get(bookingId);

      if (!booking) {
        throw new DomainError("NOT_FOUND", "Booking not found.");
      }

      const tier = store.tiers.get(booking.tierId);

      if (!tier) {
        throw new DomainError("NOT_FOUND", "Ticket tier not found.");
      }

      tier.sold -= booking.quantity;
      booking.status = "cancelled";

      return booking;
    },

    async findBookingByReference(reference) {
      const bookingId = store.bookingsByReference.get(reference);

      if (!bookingId) {
        return null;
      }

      return store.bookings.get(bookingId) ?? null;
    },
    
    async saveBooking(booking) {
      store.bookings.set(booking.id, booking);
      store.bookingsByReference.set(booking.reference, booking.id);
      return booking;
    },
  };
}
