
import { searchEvents as filterEvents } from "../domain/eventSearch.js";

// Coordinate event-related operations.
export function createEventService(repository) {
  if (
    !repository ||
    typeof repository.createEvent !== "function" ||
    typeof repository.createTier !== "function" ||
    typeof repository.publishEvent !== "function" ||
    typeof repository.listEventSummaries !== "function"
  ) {
    throw new TypeError("A valid event repository is required.");
  }

  return {
    // Create a new event.
    async createEvent(details) {
      return repository.createEvent(details);
    },

    // Add a ticket tier to an event.
    async addTier(eventId, details) {
      return repository.createTier(eventId, details);
    },

    // Publish an event.
    async publishEvent(eventId) {
      return repository.publishEvent(eventId);
    },

    // Search, filter and sort published events.
    async searchEvents(options = {}) {
      const summaries = await repository.listEventSummaries({
        publishedOnly: true,
      });

      return filterEvents(summaries, options);
    },
  };
}
