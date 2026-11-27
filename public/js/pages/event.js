
import {
  getEvent,
  createBooking,
  pay,
} from "../api.js";

import {
  element,
  formatPrice,
} from "../ui.js";

// Get the event ID from the URL.
// Example: event.html?id=event-123
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

// Page elements
const eventContent = document.querySelector("#event-content");
const checkoutPanel = document.querySelector("#checkout-panel");
const bookingSummary = document.querySelector("#booking-summary");
const countdownElement = document.querySelector("#countdown");
const holdMessage = document.querySelector("#hold-message");
const paymentForm = document.querySelector("#payment-form");
const paymentMessage = document.querySelector("#payment-message");
const payButton = document.querySelector("#pay-button");

// Keep track of the active booking and countdown.
let currentBooking = null;
let countdownInterval = null;


// Format event dates for visitors.
function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


// Display an error without inserting untrusted HTML.
function showPageError(message, replaceContent = true) {
  // Remove any previous page-level error.
  eventContent.querySelector(".page-error")?.remove();

  const errorElement = element("p", {
    className: "page-error",
    role: "alert",
    textContent: message,
  });

  if (replaceContent) {
    // Used when the page cannot load the event at all.
    eventContent.replaceChildren(errorElement);
  } else {
    // Used when an individual reservation attempt fails.
    eventContent.prepend(errorElement);
  }
}


// Create the event heading and information.
function renderEvent(event) {
  const heading = element("div", { className: "event-heading" }, [
    element("p", { className: "eyebrow", textContent: "EVENT DETAILS" }),
    element("h1", { textContent: event.title }),
    element("p", {
      className: "event-location",
      textContent: `${event.venue}, ${event.city}`,
    }),
    element("p", {
      className: "event-date",
      textContent: formatDate(event.date),
    }),
  ]);

  const tiersHeading = element("h2", {
    textContent: "Choose your ticket",
  });

  const tiersContainer = element("div", {
    className: "tiers-container",
  });

  // Each tier gets its own quantity picker and reservation button.
  for (const tier of event.tiers) {
    tiersContainer.appendChild(renderTier(tier));
  }

  eventContent.replaceChildren(
    heading,
    tiersHeading,
    tiersContainer
  );
}


// Create one ticket tier card.
function renderTier(tier) {
  const seatsLeft = tier.seatsLeft;
  const soldOut = seatsLeft <= 0;

  const quantityId = `quantity-${tier.id}`;

  const quantityLabel = element("label", {
    htmlFor: quantityId,
    textContent: "Number of tickets",
  });

  const quantityInput = element("input", {
    id: quantityId,
    name: "quantity",
    type: "number",
    min: 1,
    max: Math.min(10, seatsLeft),
    value: 1,
    required: true,
    disabled: soldOut,
  });

  const reserveButton = element("button", {
    type: "button",
    className: "primary-button",
    textContent: soldOut ? "Sold out" : "Reserve tickets",
    disabled: soldOut,
  });

  // Prevent users from selecting more than 10 tickets
  // or more tickets than the remaining inventory.
  quantityInput.addEventListener("change", () => {
    const maximum = Math.min(10, seatsLeft);
    let quantity = Number(quantityInput.value);

    if (!Number.isInteger(quantity) || quantity < 1) {
      quantity = 1;
    }

    quantityInput.value = Math.min(quantity, maximum);
  });

  reserveButton.addEventListener("click", async () => {
    const quantity = Number(quantityInput.value);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 10 ||
      quantity > seatsLeft
    ) {
      showPageError("Please choose a valid ticket quantity.");
      return;
    }

    reserveButton.disabled = true;
    reserveButton.textContent = "Reserving...";

    try {
      const response = await createBooking({
        tierId: tier.id,
        quantity,
        });

        currentBooking = response.data;

        // Retrieve the updated event after the reservation.
        // The mock inventory has already been reduced by createBooking().
        const updatedEvent = await getEvent(eventId);

        // Rebuild the ticket cards using the latest inventory.
        renderEvent(updatedEvent.data);

        // Show the checkout details for the booking we just created.
        showCheckout(currentBooking);
    } catch (error) {
      showPageError(
        error.message || "Unable to reserve these tickets.",
        false
);
      reserveButton.disabled = false;
      reserveButton.textContent = "Reserve tickets";
    }
  });

  const availability = element("p", {
    className: soldOut ? "sold-out-label" : "availability-label",
    textContent: soldOut
      ? "Sold out"
      : `${seatsLeft} seats remaining`,
  });

  return element("article", { className: "tier-card" }, [
    element("div", { className: "tier-card-header" }, [
      element("h3", { textContent: tier.name }),
      element("p", {
        className: "tier-price",
        textContent: formatPrice(tier.priceCents),
      }),
    ]),
    availability,
    quantityLabel,
    quantityInput,
    reserveButton,
  ]);
}


// Reveal checkout after the API successfully creates a booking.
function showCheckout(booking) {
  checkoutPanel.hidden = false;

  bookingSummary.replaceChildren(
    element("p", {
      textContent: `Booking reference: ${booking.reference}`,
    }),
    element("p", {
      textContent: `Quantity: ${booking.quantity} ticket(s)`,
    }),
    element("p", {
      textContent: `Total: ${formatPrice(booking.amountCents)}`,
    })
  );

  paymentMessage.textContent = "";
  holdMessage.textContent = "Your tickets are being held temporarily.";

  startCountdown(booking.expiresAt);

  // Bring the checkout section into view.
  checkoutPanel.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}


// Show the remaining hold time.
// This countdown is a frontend demonstration; the current backend
// does not enforce booking expiry or automatically release held seats.
function startCountdown(expiresAt) {
  clearInterval(countdownInterval);

  function updateCountdown() {
    const remainingMilliseconds = new Date(expiresAt).getTime() - Date.now();
    const remainingSeconds = Math.max(
      0,
      Math.floor(remainingMilliseconds / 1000)
    );

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    countdownElement.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (remainingSeconds <= 0) {
      clearInterval(countdownInterval);

      holdMessage.textContent =
        "The displayed hold time has expired. Please do not attempt payment.";

      payButton.disabled = true;
    }
  }

  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}


// Handle mock payment.
paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentBooking) {
    paymentMessage.textContent = "There is no active booking to pay for.";
    return;
  }

  if (new Date(currentBooking.expiresAt).getTime() <= Date.now()) {
    paymentMessage.textContent =
      "The displayed hold time has expired. Please start a new booking.";

    payButton.disabled = true;
    return;
  }

  // The attendee does not choose the payment outcome.
  // The mock API uses its default successful outcome.
    // const response = await pay(currentBooking.reference);

  payButton.disabled = true;
  payButton.textContent = "Processing...";

  paymentMessage.textContent = "";

  try {
    const response = await pay(currentBooking.reference);

    currentBooking = response.data;

    clearInterval(countdownInterval);

    countdownElement.textContent = "Complete";
    holdMessage.textContent = "Payment successful.";

    paymentMessage.textContent =
      `Your booking is confirmed. Reference: ${currentBooking.reference}`;

    payButton.textContent = "Payment complete";
  } catch (error) {
    // A declined payment should leave the booking pending.
    // The user can select a successful outcome and retry.
    paymentMessage.textContent =
      error.message || "Payment failed. Please try again.";

    payButton.disabled = false;
    payButton.textContent = "Try payment again";
  }
});


// Load the selected event.
async function loadEvent() {
  if (!eventId) {
    showPageError("No event was selected. Return to the events page.");
    return;
  }

  try {
    const response = await getEvent(eventId);
    renderEvent(response.data);
  } catch (error) {
    showPageError(error.message || "Unable to load this event.");
  }
}

loadEvent();
