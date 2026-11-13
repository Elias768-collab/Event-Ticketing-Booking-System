
import test from "node:test";
import assert from "node:assert/strict";

import {
  filterEvents,
  sortEvents,
  searchEvents,
} from "../src/domain/eventSearch.js";

const events = [
  {
    id: "1",
    title: "Jazz Night",
    city: "Lagos",
    venue: "Eko Hotel",
    date: "2027-01-20",
    cheapestPriceCents: 500000,
    totalSeatsLeft: 50,
  },
  {
    id: "2",
    title: "Tech Conference",
    city: "Abuja",
    venue: "Convention Centre",
    date: "2027-01-10",
    cheapestPriceCents: 300000,
    totalSeatsLeft: 100,
  },
  {
    id: "3",
    title: "Music Festival",
    city: "Lagos",
    venue: "National Theatre",
    date: "2027-01-15T17:00:00Z",
    cheapestPriceCents: 700000,
    totalSeatsLeft: 0,
  },
  {
    id: "4",
    title: "Community Meetup",
    city: "Lagos",
    venue: "Town Hall",
    date: "2027-01-25",
    cheapestPriceCents: null,
    totalSeatsLeft: 20,
  },
];

test("S05: searches event title and venue without case sensitivity", () => {
  assert.deepEqual(
    filterEvents(events, { q: "JAZZ" }).map((event) => event.id),
    ["1"]
  );

  assert.deepEqual(
    filterEvents(events, { q: "theatre" }).map((event) => event.id),
    ["3"]
  );
});

test("S05: filters city without case sensitivity", () => {
  assert.deepEqual(
    filterEvents(events, { city: "lagos" }).map((event) => event.id),
    ["1", "3", "4"]
  );
});

test("S05: filters by maximum ticket price", () => {
  assert.deepEqual(
    filterEvents(events, { maxPriceCents: 500000 }).map((event) => event.id),
    ["1", "2"]
  );
});

test("S05: excludes events without tiers from price filtering", () => {
  const noTierEvent = {
    ...events[3],
    cheapestPriceCents: null,
    tiers: [],
  };

  assert.deepEqual(
    filterEvents([noTierEvent], { maxPriceCents: 500000 }),
    []
  );
});

test("S05: sorts events by earliest date first", () => {
  assert.deepEqual(
    sortEvents(events, "date").map((event) => event.id),
    ["2", "3", "1", "4"]
  );
});

test("S05: sorts events by cheapest ticket price", () => {
  assert.deepEqual(
    sortEvents(events, "price").map((event) => event.id),
    ["2", "1", "3", "4"]
  );
});

test("S05: events without prices appear last in price sorting", () => {
  assert.equal(sortEvents(events, "price").at(-1).id, "4");
});

test("S05: sorts events by available seats, highest first", () => {
  assert.deepEqual(
    sortEvents(events, "availability").map((event) => event.id),
    ["2", "1", "4", "3"]
  );
});

test("S05: onlyAvailable excludes sold-out events", () => {
  assert.deepEqual(
    filterEvents(events, { onlyAvailable: true }).map((event) => event.id),
    ["1", "2", "4"]
  );
});

test("S05: date-only 'to' includes events throughout that day", () => {
  assert.deepEqual(
    filterEvents(events, { to: "2027-01-15" }).map((event) => event.id),
    ["2", "3"]
  );
});

test("S05: combines filters and sorting", () => {
  assert.deepEqual(
    searchEvents(events, {
      city: "Lagos",
      onlyAvailable: true,
      sortBy: "price",
    }).map((event) => event.id),
    ["1", "4"]
  );
});

test("S05: rejects invalid dates", () => {
  assert.throws(
    () => filterEvents(events, { from: "2027-02-30" }),
    { code: "VALIDATION" }
  );
});

test("S05: rejects non-integer maximum prices", () => {
  assert.throws(
    () => filterEvents(events, { maxPriceCents: 500.5 }),
    { code: "VALIDATION" }
  );
});

test("S05: rejects unknown sort options", () => {
  assert.throws(
    () => sortEvents(events, "popularity"),
    { code: "VALIDATION" }
  );
});

test("S05: does not mutate the original summaries", () => {
  const original = structuredClone(events);

  searchEvents(events, {
    city: "Lagos",
    sortBy: "price",
  });

  assert.deepEqual(events, original);
});

test("S05: handles an empty event list", () => {
  assert.deepEqual(filterEvents([], { city: "Lagos" }), []);
  assert.deepEqual(sortEvents([], "date"), []);
  assert.deepEqual(searchEvents([], {}), []);
});
