# Event Ticketing and Booking System

A backend-focused event ticketing and booking system built with JavaScript and Node.js.

The system provides functionality for creating and managing events, publishing event listings, managing ticket inventory, searching events, booking tickets, processing mock payments, cancelling bookings and managing customer waitlists.

The project is being developed incrementally as a backend engineering capstone, with emphasis on data structures, algorithms, software architecture, database operations, concurrency and automated testing.

## Project Objectives

The project demonstrates practical backend development concepts, including:

- Data structures and algorithms.
- Inventory and booking management.
- Input validation and error handling.
- Event searching, filtering and sorting.
- REST API development.
- Repository and service-layer architecture.
- Relational database design and SQL.
- Transaction management and concurrency control.
- Automated testing and regression prevention.

## Current Features

### Event Management
- Create events with unique IDs.
- Maintain draft and published event statuses.
- Require ticket tiers before publishing.
- Generate event summaries.
- Store event records persistently in SQLite.

### Ticket Inventory
- Create ticket tiers with prices and capacities.
- Track tickets sold and remaining inventory.
- Prevent bookings when inventory is insufficient.
- Use database constraints to protect inventory integrity.
- Reserve tickets through atomic SQL operations.

### Booking Management
- Book between 1 and 10 tickets per booking.
- Generate unique booking references.
- Find bookings using their references.
- Cancel pending bookings and restore available inventory.
- Prevent duplicate cancellation.
- Process successful and declined payments using a mock payment gateway.
- Enforce booking ownership checks.

### Waitlist Management
- Allow customers to join a ticket-tier waitlist.
- Manage waitlist entries using a queue data structure.

### Event Discovery
- Search by event title and venue.
- Filter by city, date, ticket price and availability.
- Sort events by date, ticket price and available seats.
- Use stable merge sort without modifying the original data.

### Database and Inventory Protection
- Persist application data using SQLite and Node.js's built-in `node:sqlite` module.
- Define primary keys, foreign keys, unique constraints and check constraints.
- Use parameterised SQL queries.
- Use transactions for booking inventory operations.
- Prevent overselling when multiple customers attempt to reserve the last available ticket.
- Provide a database seed script that skips seeding when event data already exists.

## Technology Stack

- JavaScript (ES Modules)
- Node.js
- Node.js built-in HTTP module
- Node.js built-in SQLite module (`node:sqlite`)
- SQLite
- Node.js built-in test runner (`node:test`)
- Git and GitHub

No external npm dependencies are currently required.

## Project Structure

```text
event-ticketing-booking-system/
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── user-stories.md
│   ├── milestones.md
│   ├── ai-log.md
│   └── api-examples.md
├── public/
│   └── index.html
├── scripts/
│   ├── benchmark-lookup.js
│   ├── demo.js
│   ├── seed.js
│   └── oversell-demo.js
├── src/
│   ├── config.js
│   ├── db/
│   │   ├── connection.js
│   │   └── schema.sql
│   ├── domain/
│   │   ├── bookingStateMachine.js
│   │   ├── errors.js
│   │   ├── eventSearch.js
│   │   ├── ids.js
│   │   ├── inventory.js
│   │   ├── sorting.js
│   │   └── waitListQueue.js
│   ├── http/
│   │   ├── app.js
│   │   └── router.js
│   ├── lib/
│   │   └── mockPaymentGateway.js
│   ├── repositories/
│   │   ├── memory.js
│   │   └── sqlite.js
│   ├── routes/
│   │   ├── bookingRoutes.js
│   │   └── eventRoutes.js
│   ├── services/
│   │   ├── bookingService.js
│   │   └── eventService.js
│   └── server.js
├── test/
│   ├── api.test.js
│   ├── bookingService.test.js
│   ├── oversell.test.js
│   └── ...
├── .gitignore
├── package.json
└── README.md
```

The SQLite database is created under `data/` at runtime. The database directory is excluded from Git so local database files are not committed.

## Getting Started

### Prerequisites

- Node.js installed (Node.js v24 or a compatible version supporting `node:sqlite`).
- Git installed.

### Installation

Clone the repository:

```bash
git clone https://github.com/Elias768-collab/Event-Ticketing-Booking-System.git
```

Navigate into the project:

```bash
cd Event-Ticketing-Booking-System
```

### Seed the Database

Run:

```bash
npm run seed
```

The seed script creates sample event data when the database does not already contain events. If event data already exists, seeding is skipped to avoid duplicates.

### Start the Application

```bash
npm start
```

The server runs at:

```text
http://localhost:4000
```

The port can be configured through the `PORT` environment variable.

### Health Check

```bash
curl http://localhost:4000/health
```

### Run the Demo

```bash
npm run demo
```

### Run Automated Tests

```bash
npm test
```

### Run the Overselling Demonstration

```bash
npm run oversell
```

This demonstration creates a ticket tier with one available seat and sends 50 simultaneous booking attempts. The expected result is one successful booking and 49 `SOLD_OUT` responses.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/events` | Create an event |
| POST | `/api/events/:id/tiers` | Add a ticket tier |
| POST | `/api/events/:id/publish` | Publish an event |
| GET | `/api/events` | Search and filter events |
| POST | `/api/bookings` | Create a booking |
| POST | `/api/bookings/:reference/pay` | Pay for a booking |
| POST | `/api/bookings/:reference/cancel` | Cancel a pending booking |

See [`docs/api-examples.md`](docs/api-examples.md) for request examples and instructions for testing the endpoints with curl.

## Testing

The project uses Node.js built-in testing tools:

- `node:test`
- `node:assert/strict`

The automated test suite covers:

- Event creation and validation.
- Ticket-tier creation and inventory management.
- Event publishing and unpublishing.
- Event searching, filtering and sorting.
- Booking creation, payment and cancellation.
- Booking state transitions.
- HTTP routing and application behaviour.
- SQLite inventory reservation.
- Concurrent booking attempts and overselling prevention.

**Latest verification: 72 tests passing, 0 failures.**

## Development Approach

The project is being developed incrementally through defined builds and milestones.

Each build introduces specific functionality, followed by implementation reviews, testing and documentation.

The development process also involves reviewing AI-assisted suggestions, troubleshooting implementation issues and verifying behaviour through automated tests and manual API requests.

## Project Status

### Build 1 – Core Inventory and Booking Logic
**Completed.**

Implemented event and ticket-tier management, booking creation and cancellation, booking-reference lookup, and the waitlist queue.

### Build 2 – Event Search, Sorting and Testing
**Completed.**

Added event publishing and unpublishing, event summaries, search and filtering, stable merge sorting, and automated tests.

### Build 3 – Architecture and Server Skeleton
**Completed.**

Introduced layered architecture, booking lifecycle validation, a lightweight HTTP router, the HTTP application handler, static-file serving, JSON error handling and the health endpoint.

### Build 4 – Working REST API
**Completed.**

Implemented the in-memory repository, event and booking services, REST API routes, mock payment processing, booking ownership checks and API-level tests.

### Build 5 – SQLite and the Overselling Fix
**Implementation and core verification completed.**

Introduced persistent SQLite storage using `node:sqlite`, relational database constraints, a SQLite repository, parameterised SQL queries and transaction-based inventory reservation.

The overselling demonstration and regression test verified that, with one ticket remaining and 50 simultaneous booking attempts, exactly one booking succeeds while 49 receive `SOLD_OUT`.

Data persistence was also manually verified across a server restart.

The seed script has been implemented with protection against duplicate seeding.

Further builds will extend the system according to the project milestones.

### Build 6 – Frontend Website
**Frontend implementation completed; backend integration pending.**

Implemented the VenueLink event discovery and ticket booking website using plain HTML, CSS and browser JavaScript ES modules, without a frontend framework or build tool.

The frontend includes:

- Event listing and navigation.
- Event search and filtering by city.
- Maximum ticket price filtering and event sorting.
- Event details and ticket-tier selection.
- Quantity validation, including a maximum of 10 tickets per booking.
- Sold-out ticket handling.
- Booking summary and checkout interface.
- Mock payment processing with successful and declined payment outcomes.
- Local Storage persistence for mock events, inventory and bookings.

The mock frontend currently operates independently of the production SQLite-backed API. Connecting the website to the existing backend and improving pending-booking recovery are planned for Build 7.

The existing backend regression suite remains green, with 72 tests passing and 0 failures.

## Important Implementation Notes

- The production server uses the SQLite repository.
- The in-memory repository remains available for isolated application tests.
- Payments are simulated through a mock payment gateway. No real payment provider or card details are involved.
- Booking ownership is currently identified through the `x-user-id` request header. Full authentication is a separate development concern.
- SQLite database files are generated locally and are not committed to the repository.
