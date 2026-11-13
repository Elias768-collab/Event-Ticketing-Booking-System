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
