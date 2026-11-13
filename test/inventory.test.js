
import test from "node:test";
import assert from "node:assert/strict";

import {
  createStore,
  createEvent,
  addTier,
  bookTickets,
  cancelBooking,
  publishEvent,
  unpublishEvent,
  listEventSummaries,
} from "../src/domain/inventory.js";

// A fresh store for each test prevents one test from affecting another.
function setup() {
  const store = createStore();

  const event = createEvent(store, {
    title: "Jazz Night",
    city: "Lagos",
    venue: "Eko Hotel",
    date: "2027-01-20",
  });

  return { store, event };
}

// ------------------------------
// S02: Event creation
// ------------------------------

test("S02: creates a valid event with draft status", () => {
  const { store, event } = setup();

  assert.equal(event.title, "Jazz Night");
  assert.equal(event.status, "draft");
  assert.ok(event.id);
  assert.equal(store.events.size, 1);
});

test("S02: trims whitespace from event details", () => {
  const store = createStore();

  const event = createEvent(store, {
    title: "  Jazz Night  ",
    city: "  Lagos  ",
    venue: "  Eko Hotel  ",
    date: "2027-01-20",
  });

  assert.equal(event.title, "Jazz Night");
  assert.equal(event.city, "Lagos");
  assert.equal(event.venue, "Eko Hotel");
});

test("S02: rejects missing or whitespace-only event details", () => {
  const store = createStore();

  assert.throws(
    () => createEvent(store, {
      title: " ",
      city: "Lagos",
      venue: "Eko Hotel",
      date: "2027-01-20",
    }),
    { code: "VALIDATION" }
  );

  assert.throws(
    () => createEvent(store, {
      title: "Jazz Night",
      city: "",
      venue: "Eko Hotel",
      date: "2027-01-20",
    }),
    { code: "VALIDATION" }
  );

  assert.equal(store.events.size, 0);
});

test("S02: rejects impossible calendar dates such as February 30", () => {
  const store = createStore();

  assert.throws(
    () => createEvent(store, {
      title: "Jazz Night",
      city: "Lagos",
      venue: "Eko Hotel",
      date: "2027-02-30",
    }),
    { code: "VALIDATION" }
  );

  assert.equal(store.events.size, 0);
});

test("S02: generates unique IDs for different events", () => {
  const store = createStore();

  const first = createEvent(store, {
    title: "Jazz Night",
    city: "Lagos",
    venue: "Eko Hotel",
    date: "2027-01-20",
  });

  const second = createEvent(store, {
    title: "Comedy Night",
    city: "Abuja",
    venue: "City Centre",
    date: "2027-02-20",
  });

  assert.notEqual(first.id, second.id);
  assert.equal(store.events.size, 2);
});

// ------------------------------
// S03: Ticket tier creation
// ------------------------------

test("S03: creates a ticket tier with zero tickets sold", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 100,
  });

  assert.equal(tier.name, "General");
  assert.equal(tier.priceCents, 500000);
  assert.equal(tier.capacity, 100);
  assert.equal(tier.sold, 0);
  assert.equal(tier.capacity - tier.sold, 100);
});

test("S03: rejects negative or fractional ticket prices", () => {
  const { store, event } = setup();

  assert.throws(
    () => addTier(store, event.id, {
      name: "General",
      priceCents: -100,
      capacity: 100,
    }),
    { code: "VALIDATION" }
  );

  assert.throws(
    () => addTier(store, event.id, {
      name: "General",
      priceCents: 100.5,
      capacity: 100,
    }),
    { code: "VALIDATION" }
  );

  assert.equal(store.tiers.size, 0);
});

test("S03: allows a free ticket tier", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "Free Entry",
    priceCents: 0,
    capacity: 50,
  });

  assert.equal(tier.priceCents, 0);
});

test("S03: rejects zero, negative or fractional capacity", () => {
  const { store, event } = setup();

  for (const capacity of [0, -1, 1.5]) {
    assert.throws(
      () => addTier(store, event.id, {
        name: "General",
        priceCents: 500000,
        capacity,
      }),
      { code: "VALIDATION" }
    );
  }

  assert.equal(store.tiers.size, 0);
});

test("S03: rejects adding a tier to an unknown event", () => {
  const { store } = setup();

  assert.throws(
    () => addTier(store, "unknown-event", {
      name: "General",
      priceCents: 500000,
      capacity: 100,
    }),
    { code: "NOT_FOUND" }
  );
});

// ------------------------------
// S04: Event publishing
// ------------------------------

test("S04: publishes an event that has at least one tier", () => {
  const { store, event } = setup();

  addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 100,
  });

  const published = publishEvent(store, event.id);

  assert.equal(published.status, "published");

  const publicEvents = listEventSummaries(store);

  assert.equal(publicEvents.length, 1);
  assert.equal(publicEvents[0].id, event.id);
});

test("S04: rejects publishing an event without ticket tiers", () => {
  const { store, event } = setup();

  assert.throws(
    () => publishEvent(store, event.id),
    { code: "INVALID_STATE" }
  );

  assert.equal(event.status, "draft");
  assert.equal(listEventSummaries(store).length, 0);
});

test("S04: publishing an event twice is harmless", () => {
  const { store, event } = setup();

  addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 100,
  });

  publishEvent(store, event.id);
  publishEvent(store, event.id);

  assert.equal(event.status, "published");
  assert.equal(listEventSummaries(store).length, 1);
});

test("S04: unpublishes an event without changing existing bookings", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 100,
  });

  publishEvent(store, event.id);

  const booking = bookTickets(store, tier.id, 2);

  const soldBeforeUnpublishing = tier.sold;

  unpublishEvent(store, event.id);

  assert.equal(event.status, "draft");
  assert.equal(tier.sold, soldBeforeUnpublishing);
  assert.equal(booking.status, "confirmed");
  assert.equal(booking.quantity, 2);

  assert.equal(listEventSummaries(store).length, 0);

  assert.equal(
    listEventSummaries(store, { publishedOnly: false }).length,
    1
  );
});

// ------------------------------
// S06: Ticket booking
// ------------------------------

test("S06: books tickets and updates the number sold", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 100,
  });

  const booking = bookTickets(store, tier.id, 3);

  assert.equal(booking.quantity, 3);
  assert.equal(booking.status, "confirmed");
  assert.ok(booking.reference);
  assert.equal(tier.sold, 3);
});

test("S06: rejects invalid booking quantities", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 100,
  });

  for (const quantity of [0, -1, 1.5, 11]) {
    assert.throws(
      () => bookTickets(store, tier.id, quantity),
      { code: "VALIDATION" }
    );
  }

  assert.equal(tier.sold, 0);
  assert.equal(store.bookings.size, 0);
});

test("S06: rejects a booking when insufficient tickets remain", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 5,
  });

  bookTickets(store, tier.id, 4);

  assert.throws(
    () => bookTickets(store, tier.id, 2),
    { code: "SOLD_OUT" }
  );

  // The failed booking must not change inventory or bookings.
  assert.equal(tier.sold, 4);
  assert.equal(store.bookings.size, 1);
});

test("S06: rejects booking from an unknown ticket tier", () => {
  const { store } = setup();

  assert.throws(
    () => bookTickets(store, "unknown-tier", 2),
    { code: "NOT_FOUND" }
  );

  assert.equal(store.bookings.size, 0);
});

test("S06: cancellation releases tickets back into inventory", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 10,
  });

  const booking = bookTickets(store, tier.id, 3);

  cancelBooking(store, booking.id);

  assert.equal(booking.status, "cancelled");
  assert.equal(tier.sold, 0);
});

test("S06: rejects cancelling the same booking twice", () => {
  const { store, event } = setup();

  const tier = addTier(store, event.id, {
    name: "General",
    priceCents: 500000,
    capacity: 10,
  });

  const booking = bookTickets(store, tier.id, 3);

  cancelBooking(store, booking.id);

  assert.throws(
    () => cancelBooking(store, booking.id),
    { code: "ALREADY_CANCELLED" }
  );

  assert.equal(tier.sold, 0);
});
