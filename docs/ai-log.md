# AI Usage Log

This document records AI assistance used during the development
of the Event Ticketing and Booking System capstone.

## Build 1

- Used AI to clarify implementation requirements and explain
  JavaScript concepts.
- Used AI assistance to troubleshoot implementation issues.
- Reviewed, tested, and understood the code before committing.

## Build 2: Event Search, Sorting, Backlog and First Tests

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

## Testing Summary

- `sorting.test.js`: 6 passing tests.
- `eventSearch.test.js`: 16 passing tests.
- `inventory.test.js`: 20 passing tests.
- Total: 42 passing tests.

Command used:

`npm test`

## Learning Outcomes

- Understanding stable merge sort and its time complexity.
- Understanding filtering and sorting without mutating source data.
- Applying domain validation and structured errors.
- Writing automated tests using Node.js built-in tools.
- Understanding test isolation and the Arrange–Act–Assert pattern.

## Build 3 — Architecture, State Machine and Server Skeleton

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
- All 59 project tests passed.
- Server startup and HTTP health checks verified successfully.
- Build 3 implementation completed.
