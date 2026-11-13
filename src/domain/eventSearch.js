
import { DomainError } from "./errors.js";
import { mergeSort } from "./sorting.js";

/**
 * Convert an ISO date string into a timestamp.
 * Date-only values are interpreted at midnight UTC.
 */
function parseDate(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new DomainError("VALIDATION", `${fieldName} must be a valid ISO date`);
  }

  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (dateOnlyPattern.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      throw new DomainError("VALIDATION", `${fieldName} is not a valid date`);
    }

    return date.getTime();
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    throw new DomainError("VALIDATION",`${fieldName} must be a valid ISO date`);
  }

  return timestamp;
}

/**
 * Get the cheapest ticket price for an event.
 */
function getCheapestPrice(event) {
  if (Number.isInteger(event.cheapestPriceCents)) {
    return event.cheapestPriceCents;
  }

  if (!Array.isArray(event.tiers) || event.tiers.length === 0) {
    return null;
  }

  return Math.min(...event.tiers.map((tier) => tier.priceCents));
}

/**
 * Get the total remaining seats for an event.
 */
function getSeatsLeft(event) {
  if (Number.isFinite(event.totalSeatsLeft)) {
    return event.totalSeatsLeft;
  }

  if (!Array.isArray(event.tiers)) {
    return 0;
  }

  return event.tiers.reduce((total, tier) => {
    const seatsLeft =
      Number.isFinite(tier.seatsLeft)
        ? tier.seatsLeft
        : tier.capacity - tier.sold;

    return total + seatsLeft;
  }, 0);
}

/**
 * Apply event search and filter criteria.
 * Returns a new array without modifying the original.
 */
export function filterEvents(
  summaries,
  {
    q,
    city,
    from,
    to,
    maxPriceCents,
    onlyAvailable = false,
  } = {}
) {
  if (!Array.isArray(summaries)) {
    throw new TypeError("summaries must be an array");
  }

  const searchTerm = q?.trim().toLowerCase();
  const selectedCity = city?.trim().toLowerCase();

  const fromTime =
    from === undefined ? null : parseDate(from, "from");

  let toTime =
    to === undefined ? null : parseDate(to, "to");

  // A date-only "to" value includes the entire day.
  if (toTime !== null && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
    toTime += 24 * 60 * 60 * 1000 - 1;
  }

  if (
    maxPriceCents !== undefined &&
    (!Number.isInteger(maxPriceCents) || maxPriceCents < 0)
  ) {
    throw new DomainError(
        "VALIDATION",
      "maxPriceCents must be a non-negative whole number"
    );
  }

  if (fromTime !== null && toTime !== null && fromTime > toTime) {
    throw new DomainError("VALIDATION", "from cannot be after to");
  }

  return summaries.filter((event) => {
    if (searchTerm) {
      const title = event.title?.toLowerCase() ?? "";
      const venue = event.venue?.toLowerCase() ?? "";

      if (!title.includes(searchTerm) && !venue.includes(searchTerm)) {
        return false;
      }
    }

    if (
      selectedCity &&
      event.city?.toLowerCase() !== selectedCity
    ) {
      return false;
    }

    if (fromTime !== null || toTime !== null) {
      const eventTime = parseDate(event.date, "event date");

      if (fromTime !== null && eventTime < fromTime) {
        return false;
      }

      if (toTime !== null && eventTime > toTime) {
        return false;
      }
    }

    if (maxPriceCents !== undefined) {
      const cheapestPrice = getCheapestPrice(event);

      // Events without ticket tiers are excluded from price filtering.
      if (
        cheapestPrice === null ||
        cheapestPrice > maxPriceCents
      ) {
        return false;
      }
    }

    if (onlyAvailable && getSeatsLeft(event) <= 0) {
      return false;
    }

    return true;
  });
}

/**
 * Sort event summaries using stable merge sort.
 */
export function sortEvents(summaries, sortBy = "date") {
  if (!Array.isArray(summaries)) {
    throw new TypeError("summaries must be an array");
  }

  const validSortOptions = ["date", "price", "availability"];

  if (!validSortOptions.includes(sortBy)) {
    throw new DomainError("VALIDATION", "Unknown sort option");
  }

  const compareText = (a, b) =>
    String(a ?? "").localeCompare(String(b ?? ""), undefined, {
      sensitivity: "base",
    });

  const compareTitleAndId = (a, b) => {
    const titleResult = compareText(a.title, b.title);

    if (titleResult !== 0) {
      return titleResult;
    }

    return compareText(a.id, b.id);
  };

  return mergeSort(summaries, (a, b) => {
    let result = 0;

    if (sortBy === "date") {
      result =
        parseDate(a.date, "event date") -
        parseDate(b.date, "event date");
    }

    if (sortBy === "price") {
      const priceA = getCheapestPrice(a);
      const priceB = getCheapestPrice(b);

      if (priceA === null && priceB !== null) return 1;
      if (priceA !== null && priceB === null) return -1;

      if (priceA !== null && priceB !== null) {
        result = priceA - priceB;
      }
    }

    if (sortBy === "availability") {
      result = getSeatsLeft(b) - getSeatsLeft(a);
    }

    return result === 0 ? compareTitleAndId(a, b) : result;
  });
}

/**
 * Search events by filtering first, then sorting.
 */
export function searchEvents(summaries, options = {}) {
  const { sortBy = "date", ...filters } = options;

  const filteredEvents = filterEvents(summaries, filters);

  return sortEvents(filteredEvents, sortBy);
}
