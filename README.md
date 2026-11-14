
# Event Ticketing and Booking System

A backend-focused event ticketing and booking system built with JavaScript and Node.js.

The system provides core functionality for creating events, managing ticket inventory, publishing events, searching event listings, booking tickets, cancelling bookings and managing customer waitlists.

## Project Objectives

The project demonstrates practical backend development concepts, including:

- Data structures and algorithms.
- Inventory and booking management.
- Input validation and error handling.
- Event searching, filtering and sorting.
- Automated testing.
- Efficient data lookup using JavaScript Maps.

## Current Features

### Event Management
- Create events with unique IDs.
- Maintain draft and published event statuses.
- Require ticket tiers before publishing.
- Generate event summaries.

### Ticket Inventory
- Create ticket tiers with prices and capacities.
- Track tickets sold and remaining inventory.
- Prevent bookings when inventory is insufficient.

### Booking Management
- Book between 1 and 10 tickets per booking.
- Generate unique booking references.
- Find bookings using their references.
- Cancel bookings and restore available inventory.
- Prevent duplicate cancellation.

### Waitlist Management
- Allow customers to join a ticket-tier waitlist.
- Manage waitlist entries using a queue data structure.

### Event Discovery
- Search by event title and venue.
- Filter by city, date, ticket price and availability.
- Sort by date, ticket price and available seats.
- Use stable merge sort without modifying the original data.

## Technology Stack

- JavaScript (ES Modules)
- Node.js
- Node.js built-in test runner
- Git and GitHub

## Project Structure

```text
event-ticketing-booking-system/
├── docs/
│   ├── ai-log.md
│   └── build-2.md
├── scripts/
│   ├── benchmark-lookup.js
│   └── demo.js
├── src/
│   └── domain/
│       ├── errors.js
│       ├── eventSearch.js
│       ├── ids.js
│       ├── inventory.js
│       ├── sorting.js
│       └── waitListQueue.js
├── test/
│   ├── eventSearch.test.js
│   ├── inventory.test.js
│   └── sorting.test.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js installed.
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

### Run the Demo

```bash
npm run demo
```

### Run Automated Tests

```bash
npm test
```

## Testing

The project uses Node.js built-in testing tools:

- `node:test`
- `node:assert/strict`

The current automated test suite covers sorting, event search, event creation, ticket tiers, publishing, booking and cancellation.

## Development Approach

The project is being developed incrementally through defined builds and milestones.

Each build introduces specific functionality, followed by implementation reviews, testing and documentation.

## Project Status

The project is being developed incrementally through defined builds.

- **Build 1 – Core Inventory and Booking Logic:** Completed.
  Implemented event and ticket-tier management, booking creation and cancellation,
  booking-reference lookup, and the waitlist queue.

- **Build 2 – Event Search, Sorting and Testing:** Implementation completed.
  Added event publishing and unpublishing, event summaries, search and filtering,
  stable merge sorting, and automated tests using Node.js's built-in test runner.

- **Future Builds:** Pending implementation.

The project is actively under development. Features will be added,
tested, and documented as each build is completed.


## Build 3 — Architecture and Server Skeleton

Build 3 introduces the application's architectural foundation and HTTP server.

### Implemented
- Layered architecture documented in `docs/architecture.md`.
- Booking lifecycle state machine with transition validation.
- Lightweight HTTP router supporting methods, paths and route parameters.
- HTTP application handler using Node.js built-in `http`.
- Static-file serving from `public/`.
- Path traversal protection.
- JSON request parsing and standardized error responses.
- Server configuration through environment variables.
- `/health` endpoint.
- Basic public homepage.

### Running the Application

Start the server:

```bash
npm start
```

The server uses `PORT` from the environment when configured; otherwise, it uses the default port defined in `src/config.js`.

Health check:

```bash
curl http://localhost:4000/health
```

### Testing

Run the complete test suite:

```bash
npm test
```

Build 3 verification: **59 tests passing**.