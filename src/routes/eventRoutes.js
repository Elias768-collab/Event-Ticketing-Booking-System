import { DomainError } from "../domain/errors.js";


export function registerEventRoutes(router, eventService) {
  // Create a new event.
  router.post("/api/events", async ({ body }) => {
    const event = await eventService.createEvent(body);

    return {
      status: 201,
      body: { data: event },
    };
  });

  // Add a ticket tier to an event.
  router.post("/api/events/:id/tiers", async ({ params, body }) => {
    const tier = await eventService.addTier(params.id, body);

    return {
      status: 201,
      body: { data: tier },
    };
  });

  // Publish an event.
  router.post("/api/events/:id/publish", async ({ params }) => {
    const event = await eventService.publishEvent(params.id);

    return {
      status: 200,
      body: { data: event },
    };
  });

  // Search published events.
  router.get("/api/events", async ({ query }) => {
    const options = { ...query };

    if (options.maxPriceCents !== undefined) {
      options.maxPriceCents = Number(options.maxPriceCents);
    }

    if (options.onlyAvailable !== undefined) {
      if (!["true", "false"].includes(options.onlyAvailable)) {
        throw new DomainError(
          "VALIDATION",
          "onlyAvailable must be true or false."
        );
      }

      options.onlyAvailable = options.onlyAvailable === "true";
    }

    const events = await eventService.searchEvents(options);

    return {
      status: 200,
      body: {
        data: events,
        count: events.length,
      },
    };
  });
}