
import {
  createStore,
  createEvent,
  addTier,
  bookTickets,
  cancelBooking,
  joinWaitlist
} from "../src/domain/inventory.js";

// Create the store.
const store = createStore();

// Create an event.
const event = createEvent(store, {
  title: "Backend Developers Meetup",
  city: "Benin City",
  venue: "Innovation Hub",
  date: "2026-12-15"
});

console.log("\n=== EVENT CREATED ===");
console.log(event.title);

// Create a ticket tier.
const tier = addTier(store, event.id, {
  name: "Regular",
  priceCents: 500000,
  capacity: 5
});

console.log("\n=== TICKET TIER CREATED ===");
console.log("Tier:", tier.name);
console.log("Capacity:", tier.capacity);

// Sell all available tickets.
const booking = bookTickets(store, tier.id, 5);

console.log("\n=== TICKETS SOLD OUT ===");
console.log("Booking reference:", booking.reference);
console.log("Tickets sold:", tier.sold);

// Attempt another booking.
console.log("\n=== ANOTHER BOOKING ATTEMPT ===");

try {
  bookTickets(store, tier.id, 1);
} catch (error) {
  if (error.code === "SOLD_OUT") {
    console.log("Booking refused:", error.message);
  } else {
    throw error;
  }
}

// Two customers join the waiting list.
console.log("\n=== WAITING LIST ===");

joinWaitlist(store, tier.id, "Customer A", 2);
joinWaitlist(store, tier.id, "Customer B", 1);

const queue = store.waitlists.get(tier.id);

console.log("Customers waiting:", queue.size);

// Cancel the original booking.
console.log("\n=== BOOKING CANCELLED ===");

cancelBooking(store, booking.id);

console.log("Booking status:", booking.status);
console.log("Tickets released:", tier.sold);

// Identify the next customer.
console.log("\n=== NEXT CUSTOMER ===");

const nextCustomer = queue.dequeue();

console.log("Contact next:", nextCustomer.customerName);
console.log("Tickets requested:", nextCustomer.quantity);
console.log("Customers still waiting:", queue.size);

console.log("\n=== DEMO COMPLETED ===");
