import { performance } from "node:perf_hooks";

//  Create many sample bookings.
const bookingCount = 100_000;
const iterations = 10_000;

const bookings = Array.from({ length: bookingCount }, (_, index) => ({
  id: `booking-${index}`,
  reference: `REF-${index}`
}));

// Create a Map for direct booking-reference lookup.
const bookingMap = new Map(
  bookings.map((booking) => [booking.reference, booking])
);

// Target the last booking.
const targetReference = bookings.at(-1).reference;

// Benchmark Map.get().
let start = performance.now();

for (let i = 0; i < iterations; i++) {
  bookingMap.get(targetReference);
}

const mapTime = performance.now() - start;

// Benchmark Array.find().
start = performance.now();

for (let i = 0; i < iterations; i++) {
  bookings.find(
    (booking) => booking.reference === targetReference
  );
}

const arrayTime = performance.now() - start;

// Display the results.
console.log("\n=== BOOKING LOOKUP BENCHMARK ===");
console.log("Bookings:", bookingCount);
console.log("Lookup iterations:", iterations);
console.log(`Map.get(): ${mapTime.toFixed(2)} ms`);
console.log(`Array.find(): ${arrayTime.toFixed(2)} ms`);
console.log(
  `Array.find() was ${(arrayTime / mapTime).toFixed(2)}x slower`
);