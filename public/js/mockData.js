
const seedEvents = [
  {
    id: "event-001",
    title: "Abuja Jazz Night",
    city: "Abuja",
    venue: "Transcorp Hilton",
    date: "2026-12-05T17:00:00",
    status: "published",
    tiers: [
      {
        id: "tier-001",
        name: "Regular",
        priceCents: 250000,
        capacity: 100,
        sold: 65,
      },
      {
        id: "tier-002",
        name: "VIP",
        priceCents: 500000,
        capacity: 30,
        sold: 30,
      },
    ],
  },
  {
    id: "event-002",
    title: "Lagos Tech Summit",
    city: "Lagos",
    venue: "Landmark Centre",
    date: "2027-01-20T09:00:00",
    status: "published",
    tiers: [
      {
        id: "tier-003",
        name: "Standard",
        priceCents: 150000,
        capacity: 200,
        sold: 80,
      },
      {
        id: "tier-004",
        name: "Premium",
        priceCents: 350000,
        capacity: 50,
        sold: 20,
      },
    ],
  },
  {
    id: "event-003",
    title: "Jos Cultural Festival",
    city: "Jos",
    venue: "Rwang Pam Stadium",
    date: "2027-02-14T12:00:00",
    status: "published",
    tiers: [
      {
        id: "tier-005",
        name: "General Admission",
        priceCents: 100000,
        capacity: 150,
        sold: 150,
      },
      {
        id: "tier-006",
        name: "VIP",
        priceCents: 300000,
        capacity: 20,
        sold: 20,
      },
    ],
  },
  {
    id: "event-004",
    title: "Ibadan Startup Meetup",
    city: "Ibadan",
    venue: "Cocoa House",
    date: "2027-03-10T10:00:00",
    status: "published",
    tiers: [
      {
        id: "tier-007",
        name: "Early Bird",
        priceCents: 50000,
        capacity: 80,
        sold: 15,
      },
      {
        id: "tier-008",
        name: "Regular",
        priceCents: 100000,
        capacity: 100,
        sold: 40,
      },
    ],
  },
];

// This key identifies the application's saved mock data in the browser.
const STORAGE_KEY = "venuelink-mock-state-v1";

// Read previously saved events and bookings from the browser.
function loadMockState() {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
      return null;
    }

    const parsedState = JSON.parse(savedState);

    // Basic validation prevents malformed saved data from breaking the app.
    if (
      !Array.isArray(parsedState.events) ||
      !Array.isArray(parsedState.bookings)
    ) {
      return null;
    }

    return parsedState;
  } catch (error) {
    console.warn("Could not load saved mock data:", error);
    return null;
  }
}

// Load saved data if available; otherwise use the original sample events.
const savedState = loadMockState();

let mockEvents = savedState?.events ?? seedEvents;
let mockBookings = savedState?.bookings ?? [];

// Save both inventory and booking information together.
function saveMockState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        events: mockEvents,
        bookings: mockBookings,
      })
    );
  } catch (error) {
    console.warn("Could not save mock data:", error);
  }
}

// Use the saved bookings when available.
// Otherwise, start with an empty booking list.
let bookings = mockBookings;

function getEventSummary(event) {
  const tiers = event.tiers.map((tier) => ({
    ...tier,
    eventId: event.id,
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
}

// List, filter and sort.
export async function listMockEvents(options = {}) {
  const {
    q,
    city,
    maxPriceCents,
    onlyAvailable = false,
    from,
    to,
    sortBy = "date",
  } = options;

  let results = mockEvents
    .filter((event) => event.status === "published")
    .map(getEventSummary);

  if (q?.trim()) {
    const term = q.trim().toLowerCase();

    results = results.filter((event) =>
      event.title.toLowerCase().includes(term) ||
      event.venue.toLowerCase().includes(term)
    );
  }

  if (city?.trim()) {
    results = results.filter(
      (event) =>
        event.city.toLowerCase() === city.trim().toLowerCase()
    );
  }

  if (from) {
    results = results.filter(
      (event) => new Date(event.date) >= new Date(from)
    );
  }

  if (to) {
    const end = /^\d{4}-\d{2}-\d{2}$/.test(to)
      ? new Date(`${to}T23:59:59.999`)
      : new Date(to);

    results = results.filter(
      (event) => new Date(event.date) <= end
    );
  }

  if (maxPriceCents !== undefined && maxPriceCents !== "") {
    const maximum = Number(maxPriceCents);

    results = results.filter(
      (event) =>
        event.cheapestPriceCents !== null &&
        event.cheapestPriceCents <= maximum
    );
  }

  if (onlyAvailable) {
    results = results.filter(
      (event) => event.totalSeatsLeft > 0
    );
  }

  results.sort((a, b) => {
    let difference = 0;

    if (sortBy === "price") {
      difference =
        (a.cheapestPriceCents ?? Infinity) -
        (b.cheapestPriceCents ?? Infinity);
    } else if (sortBy === "availability") {
      difference = b.totalSeatsLeft - a.totalSeatsLeft;
    } else {
      difference = new Date(a.date) - new Date(b.date);
    }

    if (difference !== 0) return difference;

    return (
      a.title.localeCompare(b.title, undefined, {
        sensitivity: "base",
      }) || a.id.localeCompare(b.id)
    );
  });

  return {
    data: results,
    count: results.length,
  };
}

export async function getMockEvent(eventId) {
  const event = mockEvents.find((item) => item.id === eventId);

  if (!event) {
    throw createError("NOT_FOUND", "Event not found.");
  }

  return {
    data: getEventSummary(event),
  };
}

export async function createMockBooking({ tierId, quantity }) {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 10
  ) {
    throw createError(
      "VALIDATION",
      "Quantity must be a whole number between 1 and 10."
    );
  }

  const event = mockEvents.find((item) =>
    item.tiers.some((tier) => tier.id === tierId)
  );

  if (!event) {
    throw createError("NOT_FOUND", "Ticket tier not found.");
  }

  const tier = event.tiers.find((item) => item.id === tierId);
  const seatsLeft = tier.capacity - tier.sold;

  if (quantity > seatsLeft) {
    throw createError(
      "SOLD_OUT",
      "Not enough tickets available."
    );
  }

  tier.sold += quantity;

  const booking = {
    id: `booking-${bookings.length + 1}`,
    reference: `MOCK-${Date.now()}-${bookings.length + 1}`,
    tierId,
    userId: "demo-user",
    quantity,
    amountCents: tier.priceCents * quantity,
    status: "pending",
    transactionId: null,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  };

  bookings.push(booking);
  saveMockState();

  return {
    data: { ...booking },
  };
}

export async function payMockBooking(reference, outcome = "success") {
  const booking = bookings.find(
    (item) => item.reference === reference
  );

  if (!booking) {
    throw createError("NOT_FOUND", "Booking not found.");
  }

  if (booking.status !== "pending") {
    throw createError(
      "INVALID_TRANSITION",
      "This booking cannot be paid for."
    );
  }

  if (!["success", "declined"].includes(outcome)) {
    throw createError("VALIDATION", "Invalid payment outcome.");
  }

  if (outcome === "declined") {
    throw createError(
      "PAYMENT_DECLINED",
      "The payment was declined. Please try again."
    );
  }

  booking.status = "paid";
  booking.transactionId = `mock-${crypto.randomUUID()}`;
  saveMockState();

  return {
    data: { ...booking },
  };
}

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}
