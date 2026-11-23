# Architecture and Design

**Event Ticketing and Booking System**

- **Document:** Architecture and Design
- **Version:** 1.1
- **Last updated:** 23 November 2026
- **Project stage:** Build 5 — SQLite Persistence and Overselling Protection
- **Author:** Elias Ademu Israel
- **Purpose:** Document the implemented system architecture, data model, booking lifecycle, technical decisions and planned architectural extensions.

---

## 1. Architectural Principles

The system follows these principles:

1. **Dependency-free Node.js:** The backend uses built-in Node.js modules without an external web framework, ORM or database package.
2. **Layered architecture:** Routes call services; services coordinate domain rules, utilities and repositories. Lower layers do not depend on higher layers.
3. **Separation of concerns:** HTTP handling, business rules and data persistence are kept separate.
4. **Repository abstraction:** Services work with repository methods rather than depending directly on a particular database implementation.
5. **Database-enforced consistency:** SQLite constraints and atomic SQL operations protect important data and inventory rules.
6. **Exactly-once state changes:** Booking status transitions prevent invalid or repeated operations.
7. **Integer-based money:** Ticket prices and booking amounts are stored as integer kobo to avoid floating-point currency errors.

---

## 2. System Architecture

### 2.1 Current architecture

The application uses a layered backend architecture.

```text
+--------------------------------------------------+
|                  CLIENT                          |
|              public/index.html                   |
+--------------------------------------------------+
                       |
                       | HTTP / JSON
                       v
+--------------------------------------------------+
|              HTTP APPLICATION                    |
|              src/http/app.js                     |
|              src/http/router.js                  |
|                                                  |
| Request handling, routing, response formatting   |
+--------------------------------------------------+
                       |
                       v
+--------------------------------------------------+
|                   ROUTES                         |
|              src/routes/                          |
|                                                  |
| Event routes and booking routes                  |
+--------------------------------------------------+
                       |
                       v
+--------------------------------------------------+
|                  SERVICES                        |
|              src/services/                        |
|                                                  |
| Event service and booking service                |
+--------------------------------------------------+
             |                 |                 |
             v                 v                 v
+------------------+ +----------------+ +------------------+
| DOMAIN           | | LIB            | | REPOSITORIES     |
| src/domain/      | | src/lib/       | | src/repositories/|
|                  | |                | |                  |
| Business rules   | | Mock payment   | | Memory / SQLite  |
| Validation       | | gateway        | | data access      |
+------------------+ +----------------+ +------------------+
                                                |
                                                v
                                  +--------------------------+
                                  |       SQLITE DATABASE    |
                                  |       src/db/            |
                                  |                          |
                                  | schema.sql               |
                                  | connection.js            |
                                  +--------------------------+
```

### 2.2 Layer responsibilities

| Layer | Responsibility |
|---|---|
| HTTP application | Receives HTTP requests, handles routing, parses request bodies, serves static files and formats responses. |
| Routes | Connect API endpoints to the appropriate service methods. |
| Services | Coordinate application use cases, including event creation, booking and payment. |
| Domain | Contains business rules, validation, booking state transitions, search and sorting logic. |
| Lib | Contains supporting utilities, including the mock payment gateway. |
| Repositories | Provide data access through a consistent interface. |
| Database | Stores persistent records and enforces database constraints. |

### 2.3 Repository injection

The application supports two repository implementations:

- `memory.js` — in-memory storage used for isolated service and API testing.
- `sqlite.js` — SQLite storage used by the running application.

The production server creates the SQLite database and injects the SQLite repository into the HTTP application.

This allows the services to use the same application logic without depending directly on the storage implementation.

### 2.4 Current project structure

```text
event-ticketing-booking-system/
│
├── src/
│   ├── config.js
│   ├── server.js
│   │
│   ├── db/
│   │   ├── connection.js
│   │   └── schema.sql
│   │
│   ├── domain/
│   │   ├── errors.js
│   │   ├── ids.js
│   │   ├── inventory.js
│   │   ├── eventSearch.js
│   │   ├── sorting.js
│   │   ├── waitListQueue.js
│   │   └── bookingStateMachine.js
│   │
│   ├── http/
│   │   ├── app.js
│   │   └── router.js
│   │
│   ├── lib/
│   │   └── mockPaymentGateway.js
│   │
│   ├── repositories/
│   │   ├── memory.js
│   │   └── sqlite.js
│   │
│   ├── routes/
│   │   ├── eventRoutes.js
│   │   └── bookingRoutes.js
│   │
│   └── services/
│       ├── eventService.js
│       └── bookingService.js
│
├── scripts/
│   ├── demo.js
│   ├── benchmark-lookup.js
│   ├── seed.js
│   └── oversell-demo.js
│
├── test/
│   ├── api.test.js
│   ├── bookingService.test.js
│   └── oversell.test.js
│
├── public/
│   └── index.html
│
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── user-stories.md
│   ├── milestones.md
│   ├── ai-prompts.md
│   ├── ai-log.md
│   └── api-examples.md
│
├── data/
│   └── ticketing.sqlite (generated locally; not committed)
│
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Data Model

### 3.1 Current database relationships

The current SQLite database contains four tables.

```text
USERS
  |
  | 1
  |
  | N
BOOKINGS
  |
  | N
  |
  | 1
TICKET_TIERS
  |
  | N
  |
  | 1
EVENTS
```

More precisely:

- One event can have multiple ticket tiers.
- One ticket tier can have multiple bookings.
- One user can have multiple bookings.
- Each booking belongs to one user and one ticket tier.

### 3.2 Current database tables

#### Users

| Column | Description |
|---|---|
| id | Primary key identifying the user. |
| created_at | Record creation timestamp. |

The current implementation creates user records when a booking is made. Authentication and user profile fields are planned for a later build.

#### Events

| Column | Description |
|---|---|
| id | Primary key. |
| title | Event title. |
| city | Event location city. |
| venue | Event venue. |
| date | Event date. |
| status | Event status: draft or published. |

#### Ticket tiers

| Column | Description |
|---|---|
| id | Primary key. |
| event_id | Foreign key referencing events. |
| name | Ticket tier name. |
| price_cents | Ticket price in integer kobo. |
| capacity | Maximum number of tickets available. |
| sold | Number of tickets reserved through bookings. |

#### Bookings

| Column | Description |
|---|---|
| id | Primary key. |
| reference | Unique booking reference. |
| tier_id | Foreign key referencing ticket tiers. |
| user_id | Foreign key referencing users. |
| quantity | Number of tickets booked. |
| amount_cents | Total booking amount in integer kobo. |
| status | Current booking status. |
| transaction_id | Unique payment transaction identifier; nullable until payment succeeds. |
| created_at | Booking creation timestamp. |

### 3.3 Database constraints

The database enforces important integrity rules.

| Table | Constraint | Purpose |
|---|---|---|
| users | PRIMARY KEY | Ensures unique user identifiers. |
| events | PRIMARY KEY | Ensures unique event identifiers. |
| events | CHECK on status | Allows only draft and published. |
| ticket_tiers | FOREIGN KEY | Every tier must belong to an existing event. |
| ticket_tiers | UNIQUE(event_id, name) | Prevents duplicate tier names within an event. |
| ticket_tiers | CHECK(price_cents >= 0) | Prevents negative ticket prices. |
| ticket_tiers | CHECK(capacity > 0) | Requires positive ticket capacity. |
| ticket_tiers | CHECK(sold >= 0 AND sold <= capacity) | Prevents invalid inventory values. |
| bookings | UNIQUE(reference) | Prevents duplicate booking references. |
| bookings | UNIQUE(transaction_id) | Prevents duplicate transaction identifiers. |
| bookings | FOREIGN KEY | Ensures the referenced tier and user exist. |
| bookings | CHECK(quantity BETWEEN 1 AND 10) | Restricts booking quantities. |
| bookings | CHECK on status | Restricts bookings to supported states. |

SQLite foreign-key enforcement is enabled through:

```sql
PRAGMA foreign_keys = ON;
``