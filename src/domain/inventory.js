import { Queue } from "./waitListQueue.js";
import { newId, newReference } from "./ids.js";
import { DomainError } from "./errors.js";

export function createStore() {
    return{
        events: new Map(),
        tiers: new Map(),
        bookings: new Map(),
        bookingsByReference: new Map(),
        waitlists: new Map()
    };
}
// Ensuring the date is a valid one
function isValidEventDate(value) {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  const datePart = value.slice(0, 10);
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateOnlyPattern.test(datePart)) {
    return false;
  }

  const [year, month, day] = datePart.split("-").map(Number);

  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    calendarDate.getUTCFullYear() === year &&
    calendarDate.getUTCMonth() === month - 1 &&
    calendarDate.getUTCDate() === day;

  return isRealDate && Number.isFinite(Date.parse(value));
}

// Creating an event
export function createEvent(store, details) {
  if (!store || !(store.events instanceof Map)) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  if (!details || typeof details !== "object" || Array.isArray(details)) {
    throw new DomainError("VALIDATION", "Event details must be an object.");
  }

  const { title, city, venue, date } = details;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof city !== "string" || !city.trim() ||
    typeof venue !== "string" || !venue.trim() ||
    typeof date !== "string" || !date.trim() ||
    !isValidEventDate(date))
   {
    throw new DomainError(
      "VALIDATION",
      "A valid title, city, venue, and date are required."
    );
  }

  const event = {
    id: newId(),
    title: title.trim(),
    city: city.trim(),
    venue: venue.trim(),
    date,
    status: "draft",
  };

  store.events.set(event.id, event);

  return event;
}

// Adding a tier (Regular, VIP)
export function addTier(store, eventId, details) {
  // Confirm that the store and event exist.
  if (!store || !(store.tiers instanceof Map)) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  if (!store.events.has(eventId)) {
    throw new DomainError("NOT_FOUND", "Event not found.");
  }

  // Validate the ticket tier details.
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    throw new DomainError("VALIDATION", "Tier details must be an object.");
  }

  const { name, priceCents, capacity } = details;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    !Number.isSafeInteger(priceCents) ||
    priceCents < 0 ||
    !Number.isSafeInteger(capacity) ||
    capacity <= 0
  ) {
    throw new DomainError(
      "VALIDATION",
      "Valid tier name, price and capacity are required."
    );
  }

  // Create the tier.
  const tier = {
    id: newId(),
    eventId,
    name: name.trim(),
    priceCents,
    capacity,
    sold: 0
  };

  // Save the tier.
  store.tiers.set(tier.id, tier);

  return tier;
}

// Booking ticket(s) for an event
export function bookTickets(store, tierId, quantity) {
  //  Validate the store.
  if (
    !store ||
    !(store.tiers instanceof Map) ||
    !(store.bookings instanceof Map) ||
    !(store.bookingsByReference instanceof Map)
  ) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  // Validate the requested quantity.
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new DomainError(
      "VALIDATION",
      "Booking quantity must be between 1 and 10."
    );
  }

  //  Find the ticket tier.
  const tier = store.tiers.get(tierId);

  if (!tier) {
    throw new DomainError("NOT_FOUND", "Ticket tier not found.");
  }

  // Check available tickets BEFORE making any changes.
  const available = tier.capacity - tier.sold;

  if (available < quantity) {
    throw new DomainError("SOLD_OUT", "Not enough tickets available.");
  }

  // Generate a unique booking reference.
  let reference;

  do {
    reference = newReference();
  } while (store.bookingsByReference.has(reference));

  // Create the booking.
  const booking = {
    id: newId(),
    reference,
    tierId,
    quantity,
    status: "confirmed"
  };

  // Update inventory and save the booking.
  tier.sold += quantity;

  store.bookings.set(booking.id, booking);
  store.bookingsByReference.set(booking.reference, booking.id);

  return booking;
}

// Cancelling a booking
export function cancelBooking(store, bookingId) {
  //  Validate the store.
  if (
    !store ||
    !(store.bookings instanceof Map) ||
    !(store.tiers instanceof Map)
  ) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  //  Find the booking.
  const booking = store.bookings.get(bookingId); 

  if (!booking) {
    throw new DomainError("NOT_FOUND", "Booking not found.");
  }

  // Prevent double cancellation.
  if (booking.status === "cancelled") {
    throw new DomainError(
      "ALREADY_CANCELLED",
      "This booking has already been cancelled."
    );
  }

  //  Find the associated ticket tier.
  const tier = store.tiers.get(booking.tierId);

  if (!tier) {
    throw new DomainError("NOT_FOUND", "Ticket tier not found.");
  }

  //  Release the tickets and update booking status.
  tier.sold -= booking.quantity;
  booking.status = "cancelled";

  return booking;
}

// Implementing: finding and verifying booking by reference
export function findBookingByReference(store, reference) {
  // Validate the store.
  if (
    !store ||
    !(store.bookings instanceof Map) ||
    !(store.bookingsByReference instanceof Map)
  ) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  // Validate the booking reference.
  if (typeof reference !== "string" || !reference.trim()) {
    throw new DomainError("VALIDATION", "A valid booking reference is required.");
  }

  // Find the internal booking ID using the reference.
  const bookingId = store.bookingsByReference.get(reference.trim());

  if (!bookingId) {
    throw new DomainError("NOT_FOUND", "Booking reference not found.");
  }

  // Retrieve and return the booking.
  return store.bookings.get(bookingId);
}

// A customer can join waitlist
export function joinWaitlist(store, tierId, customerName, quantity) {
  // Validate the store.
  if (
    !store ||
    !(store.tiers instanceof Map) ||
    !(store.waitlists instanceof Map)
  ) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  // Confirm that the ticket tier exists.
  if (!store.tiers.has(tierId)) {
    throw new DomainError("NOT_FOUND", "Ticket tier not found.");
  }

  // Validate customer name.
  if (typeof customerName !== "string" || !customerName.trim()) {
    throw new DomainError("VALIDATION", "A valid customer name is required.");
  }

  // Validate ticket quantity.
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new DomainError(
      "VALIDATION",
      "Waitlist quantity must be between 1 and 10."
    );
  }

  // Get the tier's queue or create a new one.
  let queue = store.waitlists.get(tierId);

  if (!queue) {
    queue = new Queue();
    store.waitlists.set(tierId, queue);
  }

  // Create the waitlist entry.
  const entry = {
    id: newId(),
    tierId,
    customerName: customerName.trim(),
    quantity,
    joinedAt: new Date().toISOString()
  };

  // Add the customer to the queue.
  queue.enqueue(entry);

  return entry;
}

// Publish an event so customers can see it.
// Making it publicly available
export function publishEvent(store, eventId) {
  if (!store || !(store.events instanceof Map) || !(store.tiers instanceof Map)) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  const event = store.events.get(eventId);

  if (!event) {
    throw new DomainError("NOT_FOUND", "Event not found.");
  }

  const eventTiers = [...store.tiers.values()].filter(
    (tier) => tier.eventId === eventId
  );

  if (eventTiers.length === 0) {
    throw new DomainError(
      "INVALID_STATE",
      "An event must have at least one ticket tier before publishing."
    );
  }

  event.status = "published";

  return event;
}

// Unpublish an event and return it to draft status.
export function unpublishEvent(store, eventId) {
  if (!store || !(store.events instanceof Map)) {
    throw new DomainError("VALIDATION", "A valid store is required.");
  }

  const event = store.events.get(eventId);

  if (!event) {
    throw new DomainError("NOT_FOUND", "Event not found.");
  }

  event.status = "draft";

  return event;
}

// published event summaries
export function listEventSummaries(
  store,
  { publishedOnly = true } = {}
) {
  const events = [...store.events.values()];

  const visibleEvents = publishedOnly
    ? events.filter((event) => event.status === "published")
    : events;

  return visibleEvents.map((event) => {
    const tiers = [...store.tiers.values()]
      .filter((tier) => tier.eventId === event.id)
      .map((tier) => ({
        id: tier.id,
        name: tier.name,
        priceCents: tier.priceCents,
        capacity: tier.capacity,
        sold: tier.sold,
        seatsLeft: tier.capacity - tier.sold,
      }));

    const prices = tiers.map((tier) => tier.priceCents);

    return {
      id: event.id,
      title: event.title,
      city: event.city,
      venue: event.venue,
      date: event.date,
      status: event.status,
      tiers,
      cheapestPriceCents:
        prices.length > 0 ? Math.min(...prices) : null,
      totalSeatsLeft: tiers.reduce(
        (total, tier) => total + tier.seatsLeft,
        0
      ),
    };
  });
}