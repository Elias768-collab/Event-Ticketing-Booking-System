# Event Ticketing and Booking System — API Examples

Base URL: `http://localhost:4000`

All request bodies use JSON. The API identifies users through the `x-user-id` header.

## 1. Create an event

**POST** `/api/events`

```bash
curl -X POST http://localhost:4000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Conference",
    "description": "A conference for backend developers.",
    "city": "Lagos",
    "venue": "Landmark Centre",
    "date": "2027-03-15"
  }'
```

Expected: `201 Created`

Save the returned event `id` for the next requests.

## 2. Add a ticket tier

**POST** `/api/events/:id/tiers`

Replace `EVENT_ID` with the ID returned when creating the event.

```bash
curl -X POST http://localhost:4000/api/events/EVENT_ID/tiers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular",
    "priceCents": 1500000,
    "capacity": 100
  }'
```

Expected: `201 Created`

Save the returned tier `id`.

## 3. Publish an event

**POST** `/api/events/:id/publish`

```bash
curl -X POST http://localhost:4000/api/events/EVENT_ID/publish
```

Expected: `200 OK`

The event must have at least one ticket tier before it can be published.

## 4. Search published events

**GET** `/api/events`

```bash
curl "http://localhost:4000/api/events?q=backend&city=Lagos&sortBy=date"
```

Expected: `200 OK`

Supported query parameters:

- `q`: Search event title or venue.
- `city`: Filter by city.
- `from`: Earliest event date.
- `to`: Latest event date.
- `maxPriceCents`: Maximum ticket price in cents.
- `onlyAvailable`: Filter to events with available tickets (`true` or `false`).
- `sortBy`: Sort by `date`, `price`, or `availability`.

Example with additional filters:

```bash
curl "http://localhost:4000/api/events?city=Lagos&maxPriceCents=2000000&onlyAvailable=true&sortBy=price"
```

## 5. Create a booking

**POST** `/api/bookings`

Replace `TIER_ID` with the ticket tier ID returned earlier.

```bash
curl -X POST http://localhost:4000/api/bookings \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "tierId": "TIER_ID",
    "quantity": 2
  }'
```

Expected: `201 Created`

The booking starts with `pending` status. Save its `reference` for payment or cancellation.

A booking can contain between 1 and 10 tickets from one tier.

## 6. Pay for a booking

**POST** `/api/bookings/:reference/pay`

Replace `BOOKING_REFERENCE` with the booking reference returned earlier.

Successful payment:

```bash
curl -X POST http://localhost:4000/api/bookings/BOOKING_REFERENCE/pay \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "outcome": "success"
  }'
```

Expected: `200 OK`

The booking status changes to `paid`.

Simulate a declined payment:

```bash
curl -X POST http://localhost:4000/api/bookings/BOOKING_REFERENCE/pay \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-1" \
  -d '{
    "outcome": "declined"
  }'
```

Expected: `402 Payment Required`

A declined payment leaves the booking in `pending` status.

Only the user who owns the booking can pay for it.

## 7. Cancel an unpaid booking

**POST** `/api/bookings/:reference/cancel`

Replace `BOOKING_REFERENCE` with the reference of a pending booking.

```bash
curl -X POST http://localhost:4000/api/bookings/BOOKING_REFERENCE/cancel \
  -H "x-user-id: user-1"
```

Expected: `200 OK`

The booking status changes to `cancelled`, and the reserved tickets are returned to inventory.

Only the booking owner can cancel it. Paid bookings cannot be cancelled through this endpoint.

---

## Error response format

API errors use a consistent JSON structure:

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "An explanation of the error."
  }
}
```

## Important notes

- Monetary values are represented in whole cents.
- The mock payment gateway does not process real payments or handle card details.
- The `x-user-id` header is a temporary identity mechanism for this build. Authentication will be introduced in a later milestone.
- Event, tier and booking data are stored in memory and will be lost when the server restarts.
