
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";

import { createApp } from "../src/http/app.js";
import { createMemoryRepository } from "../src/repositories/memory.js";

// Start a real HTTP server with an isolated repository.
async function startTestServer() {
  const repository = createMemoryRepository();
  const server = createServer(createApp({ repository }));

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    baseUrl,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });

        server.closeAllConnections();
      });
    },
  };
}

// Reusable event details for API requests.
const eventDetails = {
  title: "Backend Conference",
  description: "A conference for backend developers.",
  city: "Lagos",
  venue: "Landmark Centre",
  date: "2027-03-15",
};

const tierDetails = {
  name: "Regular",
  priceCents: 1500000,
  capacity: 100,
};

// Create an event and ticket tier through the API.
async function createPublishedEvent(baseUrl) {
  const eventResponse = await fetch(`${baseUrl}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventDetails),
  });

  assert.equal(eventResponse.status, 201);

  const { data: event } = await eventResponse.json();

  const tierResponse = await fetch(
    `${baseUrl}/api/events/${event.id}/tiers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tierDetails),
    }
  );

  assert.equal(tierResponse.status, 201);

  const { data: tier } = await tierResponse.json();

  const publishResponse = await fetch(
    `${baseUrl}/api/events/${event.id}/publish`,
    { method: "POST" }
  );

  assert.equal(publishResponse.status, 200);

  return { event, tier };
}

// Create a pending booking through the API.
async function createBooking(baseUrl, tierId, userId = "user-1") {
  const response = await fetch(`${baseUrl}/api/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({
      tierId,
      quantity: 2,
    }),
  });

  return {
    response,
    body: await response.json(),
  };
}

test("API creates, publishes, searches and books an event", async () => {
  const server = await startTestServer();

  try {
    const { baseUrl } = server;

    // Create event.
    const eventResponse = await fetch(`${baseUrl}/api/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventDetails),
    });

    assert.equal(eventResponse.status, 201);

    const { data: event } = await eventResponse.json();

    assert.equal(event.title, eventDetails.title);

    // Add ticket tier.
    const tierResponse = await fetch(
      `${baseUrl}/api/events/${event.id}/tiers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tierDetails),
      }
    );

    assert.equal(tierResponse.status, 201);

    const { data: tier } = await tierResponse.json();

    assert.equal(tier.name, tierDetails.name);

    // Publish event.
    const publishResponse = await fetch(
      `${baseUrl}/api/events/${event.id}/publish`,
      { method: "POST" }
    );

    assert.equal(publishResponse.status, 200);

    const publishedBody = await publishResponse.json();
    assert.equal(publishedBody.data.status, "published");

    // Search published events.
    const searchResponse = await fetch(
      `${baseUrl}/api/events?q=backend&city=Lagos&sortBy=date`
    );

    assert.equal(searchResponse.status, 200);

    const searchBody = await searchResponse.json();

    assert.equal(searchBody.count, 1);
    assert.equal(searchBody.data[0].id, event.id);

    // Create booking.
    const { response: bookingResponse, body: bookingBody } =
      await createBooking(baseUrl, tier.id);

    assert.equal(bookingResponse.status, 201);
    assert.equal(bookingBody.data.status, "pending");
    assert.equal(bookingBody.data.quantity, 2);
    assert.ok(bookingBody.data.reference);
  } finally {
    await server.close();
  }
});

test("API successfully pays for a pending booking", async () => {
  const server = await startTestServer();

  try {
    const { baseUrl } = server;
    const { tier } = await createPublishedEvent(baseUrl);

    const { body } = await createBooking(baseUrl, tier.id);

    const paymentResponse = await fetch(
      `${baseUrl}/api/bookings/${body.data.reference}/pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ outcome: "success" }),
      }
    );

    assert.equal(paymentResponse.status, 200);

    const paymentBody = await paymentResponse.json();

    assert.equal(paymentBody.data.status, "paid");
    assert.ok(paymentBody.data.transactionId);
  } finally {
    await server.close();
  }
});

test("API keeps a booking pending when payment is declined", async () => {
  const server = await startTestServer();

  try {
    const { baseUrl } = server;
    const { tier } = await createPublishedEvent(baseUrl);

    const { body } = await createBooking(baseUrl, tier.id);

    const paymentResponse = await fetch(
      `${baseUrl}/api/bookings/${body.data.reference}/pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ outcome: "declined" }),
      }
    );

    const paymentBody = await paymentResponse.json();

    assert.equal(paymentBody.error.code, "PAYMENT_DECLINED");

    assert.equal(paymentResponse.status, 402);

    // The declined payment must not change the booking status.
    const retryResponse = await fetch(
      `${baseUrl}/api/bookings/${body.data.reference}/pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-1",
        },
        body: JSON.stringify({ outcome: "success" }),
      }
    );

    assert.equal(retryResponse.status, 200);

    const retryBody = await retryResponse.json();
    assert.equal(retryBody.data.status, "paid");
  } finally {
    await server.close();
  }
});

test("API prevents another user from paying for a booking", async () => {
  const server = await startTestServer();

  try {
    const { baseUrl } = server;
    const { tier } = await createPublishedEvent(baseUrl);

    const { body } = await createBooking(baseUrl, tier.id, "user-1");

    const response = await fetch(
      `${baseUrl}/api/bookings/${body.data.reference}/pay`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-2",
        },
        body: JSON.stringify({ outcome: "success" }),
      }
    );

    const result = await response.json();

    assert.equal(result.error.code, "FORBIDDEN");
    assert.equal(response.status, 403);
    
  } finally {
    await server.close();
  }
});

test("API cancels a pending booking", async () => {
  const server = await startTestServer();

  try {
    const { baseUrl } = server;
    const { tier } = await createPublishedEvent(baseUrl);

    const { body } = await createBooking(baseUrl, tier.id);

    const cancelResponse = await fetch(
      `${baseUrl}/api/bookings/${body.data.reference}/cancel`,
      {
        method: "POST",
        headers: { "x-user-id": "user-1" },
      }
    );

    assert.equal(cancelResponse.status, 200);

    const cancelBody = await cancelResponse.json();

    assert.equal(cancelBody.data.status, "cancelled");
  } finally {
    await server.close();
  }
});

test("API returns a consistent JSON error for an unknown route", async () => {
  const server = await startTestServer();

  try {
    const response = await fetch(`${server.baseUrl}/api/unknown`);

    assert.equal(response.status, 404);

    const body = await response.json();

    assert.equal(body.error.code, "NOT_FOUND");
    assert.ok(body.error.message);
  } finally {
    await server.close();
  }
});
