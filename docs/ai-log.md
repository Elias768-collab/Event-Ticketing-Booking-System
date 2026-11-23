# AI Usage Log

This document records AI assistance used during the development of the Event Ticketing and Booking System capstone.

It documents areas where AI supported implementation, troubleshooting and learning, alongside the developer's review, testing and contributions.

## Build 1 – Core Inventory and Booking Logic

- Used AI to clarify implementation requirements and explain JavaScript concepts.
- Used AI assistance to troubleshoot implementation issues.
- Reviewed, tested and worked to understand the code before committing.

## Build 2 – Event Search, Sorting, Backlog and First Tests

### 1. Stable Merge Sort

- **AI assistance:** Discussed and implemented a stable merge sort algorithm.
- **Purpose:** Sort event summaries without modifying the original array.
- **My contribution:** Reviewed the implementation and ran automated tests for ascending order, stability, empty arrays and immutability.

### 2. Event Publishing

- **AI assistance:** Worked through event publishing and event summary functionality.
- **Purpose:** Ensure events require at least one ticket tier before publication and that public listings contain published events.
- **My contribution:** Integrated the functions into the inventory module and tested publishing behaviour.

### 3. Event Search and Filtering

- **AI assistance:** Developed search, filtering and sorting logic.
- **Purpose:** Support title, venue, city, date, price and availability filters.
- **My contribution:** Integrated the implementation and tested filtering, sorting, validation and input immutability.

### 4. Automated Testing

- **AI assistance:** Guided the creation of tests using Node.js built-in `node:test` and `node:assert/strict`.
- **Purpose:** Verify domain behaviour and prevent regressions.
- **My contribution:** Created and ran the test files, investigated failures, corrected the DomainError argument order and reran the complete test suite.

### 5. Validation and Error Handling

- **AI assistance:** Helped identify inconsistencies in error construction and improve date validation.
- **My contribution:** Applied the corrections and verified them through automated tests.

## Build 3 – Architecture, State Machine and Server Skeleton

### AI Assistance

- Used AI assistance to implement and understand the booking state machine, HTTP router, HTTP application handler, server configuration and server entry point.
- Reviewed architectural separation between domain logic, HTTP handling and server startup.
- Used AI-assisted debugging to identify and fix an undeclared `matchedRoute` variable in the HTTP application.

### Implementation

- Added explicit booking lifecycle transitions and invalid-transition protection.
- Implemented a lightweight HTTP router supporting HTTP methods, paths and route parameters.
- Implemented a Node.js HTTP application with JSON responses, request-body parsing, static-file serving and consistent error responses.
- Added protection against path traversal outside the public directory.
- Added server configuration and startup through `npm start`.
- Added a public homepage and `/health` endpoint.

### Testing

- Added booking state-machine tests for permitted and prohibited transitions.
- Added router tests for matching, parameters and HTTP methods.
- Added HTTP application tests covering health checks, static files, unknown routes, invalid JSON, valid JSON, path traversal and internal error handling.
- Verified the server through actual HTTP requests.

### Outcome

- All 59 project tests passed at the completion of this build.
- Server startup and HTTP health checks were verified successfully.
- Build 3 implementation completed.

## Build 4 – Working REST API

### Areas Where AI Assisted

- Designing the in-memory repository and separating data access from business logic.
- Implementing the event and booking services.
- Implementing the mock payment gateway.
- Connecting event and booking routes to the HTTP application.
- Writing API-level tests using Node.js `node:test`.
- Preparing curl examples for the REST API.

### Implementation Completed

- Event creation, ticket-tier creation and publishing.
- Event search, filtering and sorting.
- Booking creation with inventory reservation.
- Mock payment processing for successful and declined payments.
- Booking ownership verification.
- Booking cancellation.
- Consistent API error responses.

### My Review and Learning

I reviewed the implementation and tested the services and API behaviour. I learned how repositories, services and routes work together, how asynchronous operations are handled, and how HTTP status codes communicate API outcomes.

I also used curl to test the API independently of the automated test suite.

### Reflection

This build helped me understand how to connect domain logic to a working REST API while keeping responsibilities separated across application layers.

## Build 5 – SQLite and the Overselling Fix

### 1. SQLite Database Design

- **AI assistance:** Guided the design and implementation of the SQLite schema and database connection using Node.js's built-in `node:sqlite` module.
- **Purpose:** Replace the production server's temporary in-memory storage with persistent relational storage.
- **Implementation:** Created tables for users, events, ticket tiers and bookings, with primary keys, foreign keys, unique constraints and check constraints.
- **My contribution:** Integrated the database files and verified that the schema created the expected tables.

### 2. SQLite Repository

- **AI assistance:** Helped adapt the existing repository interface to SQLite while keeping the service layer unchanged.
- **Purpose:** Separate database operations from business logic and maintain compatibility with the existing application architecture.
- **Implementation:** Added `src/repositories/sqlite.js` with parameterised SQL queries using `?` placeholders.
- **My contribution:** Integrated the repository and verified its behaviour through the existing API and automated tests.

### 3. Reproducing the Overselling Problem

- **AI assistance:** Helped design a demonstration involving 50 simultaneous booking attempts for a ticket tier with only one available seat.
- **Purpose:** Understand why checking inventory in application code alone is insufficient for protecting shared inventory under concurrent requests.
- **Initial observation:** The first implementation allowed multiple booking records to be created even though the inventory counter remained constrained by the database.
- **Learning:** A database constraint on the final inventory value does not, by itself, make a multi-step booking operation safe. The reservation and booking-record creation must be handled as one protected operation.

### 4. Atomic Inventory Reservation

- **AI assistance:** Guided the implementation of a conditional SQL update and transaction-based booking operation.
- **Purpose:** Ensure that a ticket reservation succeeds only when sufficient inventory remains.
- **Implementation:** Used a conditional SQL statement:

```sql
UPDATE ticket_tiers
SET sold = sold + ?
WHERE id = ?
  AND sold + ? <= capacity;
```

The application checks the number of affected rows. If no row is updated, the operation returns a `SOLD_OUT` error.

The inventory update and booking insertion are performed within a database transaction so that a failed operation does not leave a partial booking record.

- **My contribution:** Integrated the fix, ran the overselling demonstration and verified the resulting inventory and booking records.

### 5. Overselling Regression Test

- **AI assistance:** Helped design an automated regression test for the concurrency scenario.
- **Purpose:** Prevent future changes from reintroducing the overselling problem.
- **Implementation:** Added `test/oversell.test.js`.
- **Verification:** The test sends 50 booking attempts for one available seat and checks that exactly one succeeds, 49 return `SOLD_OUT`, and only one booking record is created.

### 6. Database Persistence and Seeding

- **AI assistance:** Guided the integration of the SQLite repository into the production server and the creation of a database seed script.
- **Purpose:** Ensure data survives server restarts and provide a repeatable way to populate an empty database.
- **Implementation:** Added `scripts/seed.js` and the `npm run seed` command. The script checks for existing events before inserting sample data.
- **My contribution:** Created an event through the API, stopped and restarted the server, and queried the event again to verify that its data persisted.
- **Verification:** Ran the seed command twice against an already populated database. Both runs correctly skipped seeding.

### 7. Build 5 Verification

The complete automated test suite passed:

- **Total tests:** 72
- **Passed:** 72
- **Failed:** 0

The overselling demonstration produced:

| Measurement | Result |
|---|---:|
| Booking attempts | 50 |
| Successful bookings | 1 |
| Failed bookings | 49 |
| `SOLD_OUT` responses | 49 |
| Seats sold | 1 |
| Booking records created | 1 |
| Available seats | 0 |

Data persistence was also verified through a server restart.

### Learning Outcomes

- Understanding relational database design and SQL constraints.
- Using Node.js's built-in SQLite module.
- Understanding parameterised SQL queries and why they matter.
- Understanding why a multi-step inventory operation needs transaction protection.
- Learning how conditional SQL updates can enforce inventory limits.
- Understanding the difference between an application-level availability check and a database-level atomic reservation.
- Using automated regression tests to verify concurrency-sensitive behaviour.
- Understanding how persistent repositories fit into a layered backend architecture.

### Reflection

Build 5 helped me understand that protecting inventory is not simply about checking whether tickets are available before creating a booking.

The important lesson was that the database must enforce the reservation safely. A conditional SQL update, combined with a transaction, ensures that competing booking requests cannot reserve more tickets than the available capacity.

This build also introduced me to persistent database integration and gave me practical experience investigating and fixing an overselling problem rather than only implementing the expected successful booking flow.

## Overall Development Practice

Throughout the project, AI assistance was used as a development and learning aid for understanding requirements, exploring implementation approaches, troubleshooting errors and reviewing technical concepts.

The implementation was integrated and verified through local execution, automated tests and manual API requests. The objective has been to understand the decisions behind the code rather than simply copy generated solutions.
