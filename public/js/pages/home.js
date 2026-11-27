
import { listEvents } from "../api.js";
import { element, formatPrice } from "../ui.js";

const filterForm = document.querySelector("#filter-form");
const eventList = document.querySelector("#event-list");
const resultsCount = document.querySelector("#results-count");
const resetButton = document.querySelector("#reset-filters");


function createEventCard(event) {
  const available = event.totalSeatsLeft > 0;

  const startingPrice = event.cheapestPriceCents === null
    ? "No tickets available"
    : `From ${formatPrice(event.cheapestPriceCents)}`;

  return element("article", { className: "event-card" }, [
    element("div", { className: "event-card-content" }, [
      element("span", {
        className: "event-status",
        textContent: available ? "Tickets available" : "Sold out",
      }),
      element("h3", {}, event.title),
      element("p", { className: "event-location" },
        `${event.venue}, ${event.city}`
      ),
      element("p", { className: "event-date" },
        new Date(event.date).toLocaleString("en-NG", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      ),
      element("p", { className: "event-price" }, startingPrice),
      element("p", { className: "event-seats" },
        `${event.totalSeatsLeft} seats remaining`
      ),
      element("a", {
        className: "button button-primary",
        href: `./event.html?id=${encodeURIComponent(event.id)}`,
      }, "View event"),
    ]),
  ]);
}

function renderEvents(events) {
  eventList.replaceChildren();

  resultsCount.textContent =
    `${events.length} event${events.length === 1 ? "" : "s"} found`;

  if (events.length === 0) {
    eventList.appendChild(
      element("p", { className: "empty-state" },
        "No events match your search. Try changing your filters."
      )
    );
    return;
  }

  for (const event of events) {
    eventList.appendChild(createEventCard(event));
  }
}

async function loadEvents(options = {}) {
  eventList.replaceChildren(
    element("p", {}, "Loading events...")
  );

  try {
    const response = await listEvents(options);
    renderEvents(response.data);
  } catch (error) {
    eventList.replaceChildren(
      element("p", { className: "error-message" }, error.message)
    );
  }
}

function getFilters() {
  const formData = new FormData(filterForm);

  const filters = {
    q: formData.get("q").trim(),
    city: formData.get("city").trim(),
    sortBy: formData.get("sortBy"),
    onlyAvailable: formData.get("onlyAvailable") === "on",
  };

  const maxPrice = formData.get("maxPrice").trim();

  if (maxPrice !== "") {
    const naira = Number(maxPrice);

    if (!Number.isSafeInteger(naira) || naira < 0) {
      throw new Error("Maximum price must be a non-negative whole number.");
    }

    filters.maxPriceCents = naira * 100;
  }

  return filters;
}

filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await loadEvents(getFilters());
  } catch (error) {
    eventList.replaceChildren(
      element("p", { className: "error-message" }, error.message)
    );
  }
});

resetButton.addEventListener("click", () => {
  // Wait until the browser has reset the form controls.
  requestAnimationFrame(() => loadEvents());
});

loadEvents();
