import { assertTransition } from "../domain/bookingStateMachine.js";
import { DomainError } from "../domain/errors.js";

export function createBookingService(repository, paymentGateway) {
  if (
    !repository ||
    typeof repository.createPendingBooking !== "function" ||
    typeof repository.findBookingByReference !== "function" ||
    typeof repository.saveBooking !== "function" ||
    typeof repository.cancelPendingBooking !== "function"
  ) {
    throw new TypeError("A valid booking repository is required.");
  }

  if (!paymentGateway || typeof paymentGateway.charge !== "function") {
    throw new TypeError("A valid payment gateway is required.");
  }

  async function findOwnedBooking(reference, userId) {
      if (typeof userId !== "string" || !userId.trim()) {
        throw new DomainError("VALIDATION", "A valid user ID is required.");
      }

      const booking = await repository.findBookingByReference(reference);

      if (!booking) {
        throw new DomainError("NOT_FOUND", "Booking not found.");
      }

      if (booking.userId !== userId.trim()) {
        throw new DomainError("FORBIDDEN", "You cannot access this booking.");
      }

      return booking;
    }
  return {
    async createBooking({ tierId, quantity, userId }) {
      return repository.createPendingBooking(tierId, quantity, userId);
    },

    async payBooking(reference, userId, { outcome = "success" } = {}) {
      const booking = await findOwnedBooking(reference, userId);

      assertTransition(booking.status, "paid");

      const payment = await paymentGateway.charge({
        amountCents: booking.amountCents,
        outcome,
      });

      // Validate the gateway response.
      if (!payment || typeof payment.success !== "boolean") {
        throw new DomainError(
          "PAYMENT_ERROR",
          "The payment gateway returned an invalid response."
        );
      }

      if (!payment.success) {
        throw new DomainError(
          payment.code || "PAYMENT_DECLINED",
          payment.message || "The payment was declined."
        );
      }

      booking.status = "paid";
      booking.transactionId = payment.transactionId;

      return repository.saveBooking(booking);
    },

    async cancelBooking(reference, userId) {
      const booking = await findOwnedBooking(reference, userId);

      assertTransition(booking.status, "cancelled");

      return repository.cancelPendingBooking(booking.id);
    },
  };
}