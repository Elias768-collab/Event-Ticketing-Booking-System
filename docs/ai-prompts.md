## AI Prompts: Builds 1 to 9
The tutor's ten prompts, copied word for word from docs/build-1.md to build-9.md

Document: Prompt pack (supplement to the PRD, User Stories, Milestones and Architecture PDFs)
Source: There is no separate prompt file in the tutor's repository. Each prompt lives in the "AI prompt" section of its docs/build-N.md file. Nothing below has been edited.
Count: 10 prompts: one for each of Builds 1 to 4 and 6 to 9, and two for Build 5.
How to use: For each build: (1) give the AI tool the files listed under "Give it first"; (2) paste the prompt; (3) do not trust the answer: read the code, run the "Done when" checks, and write what was wrong in docs/ai-log.md.
Reminder: Prompts mention files the tutor will provide later: docs/debugging-exercise.md (Build 8) and public/js/qr.js (Build 9).
Prompts are shown in monospace exactly as written, including line breaks. Copy from the markdown files in the repo if you need to paste without any PDF line-wrap risk.

## Build 1: Domain core in the terminal
Give it first: README.md and docs/build-1.md.

We are starting the Event Ticketing capstone in plain JavaScript (ES modules,
Node 22.13 or newer, no outside packages). It runs in the terminal only: no
server, no database. Read README.md and docs/build-1.md before you write
anything.

Create these files, and set "type": "module" in package.json.

1. src/domain/errors.js: a DomainError class that extends Error and carries a
   machine-readable code (for example VALIDATION, NOT_FOUND, SOLD_OUT).

2. src/domain/ids.js: newId() and newReference(). Use node:crypto, never
   Math.random. A reference is a short, readable booking code that is safe to
   read aloud.

3. src/domain/waitlistQueue.js: a first-in-first-out Queue class built as a
   linked list, with private fields. enqueue, dequeue, peek and size must all
   be fast (O(1)). Do not use array.shift().

4. src/domain/inventory.js: createStore(), createEvent, addTier, bookTickets,
   cancelBooking, findBookingByReference and joinWaitlist.
   - A booking is for 1 to 10 tickets from one tier.
   - If there are not enough seats, throw SOLD_OUT and change nothing.
   - Cancelling releases the seats. Cancelling twice is an error.
   - Find a booking by its reference in O(1) with a Map.

5. scripts/demo.js: tells the whole story. An event sells out, a booking is
   refused, two people join the waitlist, a booking is cancelled, and the next
   person in line is named.

6. scripts/benchmark-lookup.js: compares Map.get with Array.find over many
   bookings and prints both timings. Add "demo" and "benchmark" scripts to
   package.json.

Rules: money is whole cents (never decimals); validate every input and throw a
DomainError with a code; a failed booking must not change anything. When you
are done, list every file you created and any rule from this prompt that you
were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.


## Build 2: Event search, sorting, backlog, first tests
Give it first: README.md, docs/user-stories.md, docs/build-2.md and src/domain/.

We are building Build 2 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-2.md and everything in src/domain/ before you write
anything.

Add the following. Do not change what already works.

1. src/domain/sorting.js: mergeSort(items, compare). Write the merge sort
   yourself. Do NOT call Array.prototype.sort. It must be stable (equal items
   keep their original order), it must return a NEW array, and it must never
   modify the one it was given.

2. In inventory.js: publishEvent(store, eventId) and
   listEventSummaries(store, { publishedOnly = true }). Publishing an event
   with no ticket tiers is an INVALID_STATE error. Drafts are hidden from the
   public list.

3. src/domain/eventSearch.js, pure functions only (events in, new list out):
   - filterEvents(summaries, { q, city, from, to, maxPriceCents, onlyAvailable })
     q matches title or venue, ignoring case. city matches exactly, ignoring
     case. from and to are inclusive, and a date-only 'to' includes that whole
     day. maxPriceCents compares with the cheapest tier. Events with no tiers
     are left out of price filters. A bad date or a price that is not a whole
     number is a VALIDATION error.
   - sortEvents(summaries, sortBy) where sortBy is 'date' (earliest first),
     'price' (cheapest first, no price last) or 'availability' (most seats
     left first). Always break ties by title, then id. Use your mergeSort.
     An unknown sortBy is a VALIDATION error.
   - searchEvents(summaries, criteria, sortBy) = filter, then sort.

4. Tests using node:test and node:assert/strict, in test/. One test for every
   acceptance criterion for S02, S03, S05 and S06 in docs/build-2.md, and
   one for each S04 criterion about publishing that our class wrote.
   Include: the original list is unchanged after sorting and filtering, the
   sort is stable, an empty list, and every error code.

5. Add an "npm test" script to package.json.

Rules: money is whole cents; dates are ISO strings; errors are DomainError with
a code; no mutation of inputs. When you are done, list every file you changed
and any rule from this prompt that you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.


## Build 3: Architecture, state machine, server skeleton
Give it first: README.md, docs/user-stories.md, docs/build-3.md and src/domain/.

We are building Build 3 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-3.md and everything in src/domain/ before you
write anything. Do not change what already works.

1. docs/architecture.md with three Mermaid diagrams: the layers (routes call
   services, services call rules and repositories, nothing calls upwards), the
   data model (events, ticket tiers, bookings, users) and the booking life
   cycle. Under the layer diagram, write one sentence for each layer saying
   what it may and may not do.

2. src/domain/bookingStateMachine.js: the states pending, paid, cancelled,
   refunded and checked_in as data. Allowed moves: pending to paid or
   cancelled; paid to checked_in, refunded or cancelled. cancelled, refunded
   and checked_in are final: nothing leaves them. Export canTransition and
   assertTransition, and throw a DomainError with the code INVALID_TRANSITION
   for an illegal move.

3. A tiny router in src/http/router.js (method plus path, with :params) and a
   server in src/http/app.js built on node:http only.
   - GET /health returns {"status":"ok"}.
   - Unknown /api paths return a JSON 404. Bad JSON returns a JSON 400.
   - Every error has the same shape: {"error":{"code","message"}}.
   - Serve files from public/ and never allow a path to escape that folder.

4. src/server.js and src/config.js. The port comes from the PORT environment
   variable, default 3000. Add a "start" script to package.json.

5. Tests with node:test: every allowed and every illegal booking move, the
   router, and one real HTTP request to /health.

Rules: a stack trace must never reach the client; business rules do not live
in route handlers. When you are done, list every file you changed and any rule
from this prompt that you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.


## Build 4: Working REST API (in memory)
Give it first: README.md, docs/user-stories.md, docs/build-4.md, docs/architecture.md and everything in src/.

We are building Build 4 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-4.md, docs/architecture.md and everything in
src/ before you write anything. Follow the layer rules in the architecture doc.

Build a working REST API that keeps its data in memory.

1. src/repositories/memory.js: a repository with async methods for events,
   tiers and bookings. Services receive the repository as an argument; they do
   not import it.

2. src/services/eventService.js and bookingService.js. All business rules live
   here. Reuse the rules from src/domain/ (the state machine, search and
   sorting). Do not copy them.

3. src/lib/mockPaymentGateway.js: an async charge() that returns success, or a
   decline when asked. It never sees a card number.

4. Routes, with the same error shape as /health:
   - POST /api/events and POST /api/events/:id/tiers
   - POST /api/events/:id/publish
   - GET /api/events (search, filter and sort through query parameters)
   - POST /api/bookings (book tickets from a tier)
   - POST /api/bookings/:reference/pay (success, or PAYMENT_DECLINED)
   - POST /api/bookings/:reference/cancel (unpaid bookings only for now)
   Until Build 7, the caller identifies themselves with an x-user-id header.

5. docs/api-examples.md: one curl example for every call, in the order
   create, publish, book, pay.

6. API tests with node:test that start the real server on a free port.

Rules: money is whole cents; a declined card leaves the booking pending; a
booking can only be paid by the person who made it. Keep it simple. Do not add
locks or transactions yet. When you are done, list every file you changed and
any rule from this prompt that you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.


## Build 5: SQLite and the overselling fix
Give it first: README.md, docs/user-stories.md, docs/build-5.md and everything in src/.

Prompt 1: move to SQLite and reproduce the problem
We are building Build 5 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-5.md and everything in src/ before you write
anything.

1. src/db/schema.sql and src/db/connection.js using node:sqlite. Tables for
   users, events, ticket_tiers and bookings, with PRIMARY KEY, FOREIGN KEY,
   UNIQUE and CHECK constraints. Include CHECK (sold >= 0 AND sold <= capacity).

2. src/repositories/sqlite.js with the same methods as memory.js, so the
   services do not change. Every query uses placeholders (?). Never build SQL
   by joining strings.

3. scripts/seed.js that fills the database once, and a "seed" script in
   package.json. The server must keep its data after a restart.

4. scripts/oversell-demo.js: create an event with exactly 1 seat left, then
   fire 50 booking requests at it at the same moment using Promise.all. Print
   how many bookings succeeded and how many seats were sold.

Do not fix any overselling yet. We want to see the problem first. Add
"oversell" to package.json scripts. When you are done, list every file you
changed and any rule from this prompt that you were unsure about.

Prompt 2: fix it

The demo shows more than one booking for the last seat. Fix it in the database,
not in JavaScript.

- Reserve the seats with one atomic statement, for example
  UPDATE ticket_tiers SET sold = sold + ? WHERE id = ? AND sold + ? <= capacity,
  and use the number of changed rows to know whether we won the seat. If no
  row changed, throw SOLD_OUT.
- Do not use a lock variable, and do not check twice. Explain in two sentences
  why those do not work.
- Add test/oversell.test.js: 50 simultaneous bookings for 1 seat give exactly
  1 success and 49 SOLD_OUT. The test must fail if the fix is removed.
- Show the demo again with the numbers before and after.

List every file you changed and anything you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.

## Build 6: Frontend on mock data
Give it first: README.md, docs/user-stories.md, docs/build-6.md and docs/api-examples.md.

We are building Build 6 of the Event Ticketing capstone: the website, in plain
HTML, CSS and JavaScript (ES modules in the browser, no framework, no build
step). Read README.md, docs/user-stories.md, docs/build-6.md and
docs/api-examples.md before you write anything.

1. public/index.html: browse events, with search, a city filter, a maximum
   price and a sort menu. public/event.html: one event, its tiers, a quantity
   picker, and checkout.

2. public/js/ui.js with a small el(tag, props, children) helper that builds
   DOM nodes. Use textContent and never innerHTML for any data.

3. public/js/mockData.js and public/js/api.js. api.js exports the functions
   the pages call (listEvents, getEvent, createBooking, pay) and returns
   promises with the same shape as the real API in docs/api-examples.md. For
   now they read from mockData.js. Pages must never call fetch directly.

4. public/js/pages/home.js and event.js, and public/css/styles.css.

Rules:
- Prices are whole cents. Format them in one function: 250000 shows as ₦2,500.
- A quantity cannot go above 10 or above the seats left.
- A sold-out tier is clearly marked and its button is disabled.
- Checkout shows a countdown for how long the seats are held.
- A declined mock card shows an error and lets the user try again.
- Every form control has a label; use a button for actions and a link for
  navigation.

When you are done, list every file you changed and any rule from this prompt
that you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.

## Build 7: Login, roles and a connected app
Give it first: README.md, docs/user-stories.md, docs/build-7.md, docs/api-examples.md and everything in src/ and public/.

We are building Build 7 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-7.md, docs/api-examples.md and everything in
src/ and public/ before you write anything.

1. src/lib/password.js: hash and verify passwords with scrypt from node:crypto,
   with a random salt per password and a constant-time comparison.

2. src/lib/token.js: sign and verify HS256 tokens with node:crypto. Tokens
   expire. Reject any token whose header says alg is anything but HS256. The
   secret comes from an environment variable.

3. src/services/authService.js and src/routes/auth.js: POST /api/auth/signup
   (email, password of at least 8 characters, role of attendee, organizer or
   staff), POST /api/auth/login and GET /api/auth/me. The wrong password and an
   unknown email give the same INVALID_CREDENTIALS error. A repeated email
   gives EMAIL_TAKEN.

4. src/http/guards.js: requireUser and requireRole. Replace the x-user-id
   header everywhere with the bearer token. Ownership checks:
   - an attendee can only read or cancel their own bookings (another person's
     booking gives NOT_FOUND)
   - an organizer can only change their own events (otherwise FORBIDDEN)

5. Frontend: replace the mock api.js with one that uses fetch and sends
   Authorization: Bearer <token>. Add public/js/session.js, login.html,
   tickets.html (my tickets) and organizer.html (create events and tiers,
   publish). Show loading and error states.

6. Tests: signup, login, bad token, expired token, wrong role, and one
   attendee reading another's booking.

Rules: never store, log or return a password; the role is checked on the
server, never only in the page. When you are done, list every file you changed
and any rule from this prompt that you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.

## Build 8: Refunds, waitlist, expiry, real test suite
Give it first: README.md, docs/user-stories.md, docs/build-8.md, docs/debugging-exercise.md (when your instructor gives it to you) and everything in src/ and test/.

We are building Build 8 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-8.md and everything in src/ and test/ before
you write anything.

1. src/lib/clock.js: a clock that the code asks for the time, so tests can
   control "now".

2. src/domain/refundPolicy.js, a pure function calculateRefund({ amountCents,
   startsAt, now }): 7 days or more before the start is 100%, 2 days or more
   is 50%, under 2 days is 0%. An exact boundary belongs to the better tier.
   An event that has started throws EVENT_STARTED. Use Math.floor on cents.

3. Cancelling a paid booking: use the state machine, call the mock gateway's
   refund, and release the seats exactly once. Cancelling twice must not
   release the seats twice. Do it with a compare-and-set on the booking status.

4. src/services/seatService.js and waitlistService.js: when seats are freed,
   offer them to the first person on the waitlist, hold the seats for that
   person for the offer time, and pass them to the next person if the offer
   expires. POST /api/waitlist to join (NOT_SOLD_OUT if seats remain,
   ALREADY_ON_WAITLIST for a repeat), and an accept route (OFFER_EXPIRED
   after the deadline).

5. src/jobs/maintenance.js: cancel pending bookings older than the hold time
   and release their seats, then offer the freed seats to the waitlist. Tests
   call the job directly. The server runs it with setInterval.

6. UI: cancelling shows the refund amount before you confirm; sold-out tiers
   offer "Join waitlist"; an offer shows a countdown and an Accept button.

7. Tests for every rule: each refund boundary (exactly 7 days, 6 days 23
   hours, exactly 2 days, 1 day 23 hours), cancelling twice, waitlist order,
   an offer expiring and passing on, and an unpaid hold expiring.

Rules: money is whole cents; seats are never released twice; a waitlist offer
really holds the seats. When you are done, list every file you changed and any
rule from this prompt that you were unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.

## Build 9: QR check-in, CI, security, demo-ready
Give it first: README.md, docs/user-stories.md, docs/build-9.md and everything in src/, public/ and test/.

We are building Build 9 of the Event Ticketing capstone, in plain JavaScript
(ES modules, Node 22.13 or newer, no outside packages). Read README.md,
docs/user-stories.md, docs/build-9.md and everything in src/, public/ and
test/ before you write anything.

1. src/lib/ticketToken.js: sign and verify a ticket token with HMAC-SHA256 from
   node:crypto and compare in constant time. The payload holds only the
   booking reference and an issued-at time, never a name or an email. Use a
   different secret from the login tokens, from an environment variable, with
   no default value in production code.

2. A QR code for every paid booking on tickets.html. The encoder is the
   vendored public/js/qr.js; treat it as a black box and only call it.

3. src/services/checkinService.js, POST /api/checkin and public/checkin.html
   (paste or scan a code), for staff only.
   - A code that was edited or made up is INVALID.
   - A booking that is cancelled or refunded is rejected.
   - A code already used is rejected as a duplicate and shows when it was
     first used.
   - Two staff scanning the same code at the same moment: exactly one is
     admitted. Do it in a single atomic UPDATE, not a read then a write.

4. src/http/securityHeaders.js (Content-Security-Policy with no inline
   scripts, X-Content-Type-Options, Referrer-Policy) and src/lib/rateLimit.js
   (limit login and check-in attempts per IP).

5. .github/workflows/ci.yml: on every push and pull request, set up Node 22,
   run npm test.

6. docs/security-checklist.md, a short checklist of what we protect and how,
   and a .env.example with the secrets the app needs (no real values).

7. Tests: a forged token, a duplicate scan, a cancelled booking's code, a
   wrong role, and two simultaneous scans.

Rules: no secret in Git; no personal data in the QR code. When you are done,
list every file you changed and any rule from this prompt that you were
unsure about.
After it answers: read the code, run the checks in "Done when", and record what was wrong in docs/ai-log.md.

