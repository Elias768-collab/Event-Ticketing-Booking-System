
import test from "node:test";
import assert from "node:assert/strict";

import { createMemoryRepository } from "../src/repositories/memory.js";
import { createBookingService } from "../src/services/bookingService.js";
import { createEventService } from "../src/services/eventService.js";
import { createMockPaymentGateway } from "../src/lib/mockPaymentGateway.js";

async function createBookingTestContext() {
  const repository = createMemoryRepository();
  const eventService = createEventService(repository);
  const paymentGateway = createMockPaymentGateway();
  const bookingService = createBookingService(repository, paymentGateway);

  // Create and publish an event with an available ticket tier.
  const event = await eventService.createEvent({
    title: "Backend Conference",
    description: "A test event",
    city: "Lagos",
    venue: "Landmark Centre",
    date: "2027-03-15",
  });

  const tier = await eventService.addTier(event.id, {
    name: "Regular",
    priceCents: 1500000,
    capacity: 100,
  });

  await eventService.publishEvent(event.id);

  return {
    repository,
    bookingService,
    tier,
  };
}

// Test 1: A user can create a pending booking.
test("creates a pending booking and reserves tickets", async () => {
  const { bookingService, repository, tier } =
    await createBookingTestContext();

  const booking = await bookingService.createBooking({
    tierId: tier.id,
    quantity: 2,
    userId: "user-1",
  });

  assert.equal(booking.status, "pending");
  assert.equal(booking.quantity, 2);
  assert.equal(booking.amountCents, 3000000);
  assert.equal(
    (await repository.findTierById(tier.id)).sold,
    2
  );
});

// Test 2: Successful payment changes the booking status to paid.
test("successfully pays for a pending booking", async () => {
  const { bookingService, tier} = await createBookingTestContext();

  const booking = await bookingService.createBooking({
    tierId: tier.id,
    quantity: 1,
    userId: "user-1",
  });

  const paidBooking = await bookingService.payBooking(
    booking.reference,
    "user-1"
  );

  assert.equal(paidBooking.status, "paid");
  assert.ok(paidBooking.transactionId);
});

// Test 3: Declined payment leaves the booking pending.
test("keeps booking pending when payment is declined", async () => {
  const { bookingService, repository, tier } = 
    await createBookingTestContext();

  const booking = await bookingService.createBooking({
    tierId: tier.id,
    quantity: 1,
    userId: "user-1",
  });

  await assert.rejects(
    bookingService.payBooking(booking.reference, "user-1", {
      outcome: "declined",
    }),
    { code: "PAYMENT_DECLINED" }
  );

  const unchangedBooking = await repository.findBookingByReference(
    booking.reference
  );

  assert.equal(unchangedBooking.status, "pending");
});

// Test 4: Another user cannot pay for the booking.
test("prevents another user from paying for a booking", async () => {
  const { bookingService, tier } = await createBookingTestContext();

  const booking = await bookingService.createBooking({
    tierId: tier.id,
    quantity: 1,
    userId: "user-1",
  });

  await assert.rejects(
    bookingService.payBooking(booking.reference, "user-2"),
    { code: "FORBIDDEN" }
  );

  assert.equal(booking.status, "pending");
});

// Test 5: A booking cannot be paid for twice.
test("prevents double payment", async () => {
  const { bookingService, tier } = await createBookingTestContext();

  const booking = await bookingService.createBooking({
    tierId: tier.id,
    quantity: 1,
    userId: "user-1",
  });

  await bookingService.payBooking(booking.reference, "user-1");

  await assert.rejects(
    bookingService.payBooking(booking.reference, "user-1"),
    { code: "INVALID_TRANSITION" }
  );

  assert.equal(booking.status, "paid");
});

// Test 6: Cancelling a pending booking releases reserved tickets.
test("cancels a pending booking and releases reserved tickets", async () => {
  const { bookingService, repository, tier } =
    await createBookingTestContext();

  const booking = await bookingService.createBooking({
    tierId: tier.id,
    quantity: 3,
    userId: "user-1",
  });

  await bookingService.cancelBooking(booking.reference, "user-1");

  const updatedTier = await repository.findTierById(tier.id);

  assert.equal(booking.status, "cancelled");
  assert.equal(updatedTier.sold, 0);
});
