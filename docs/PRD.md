## PRODUCT REQUIREMENT DOCUMENT
## Event Ticketing and Booking Platform — DAS 2026 Software Engineering Capstone

Document: PRD (1 of 4: PRD, User Stories, Milestones, Architecture)
Version / date: 1.0 — 3 November 2026
Author: [Your Name] — individual project
Source of truth: Tutor repository das-2026-capstone-project: README, docs/milestones.md, docs/user-stories.md, docs/build-1.md to build-9.md
Delivery window: 15 days: 4 Nov to 18 Nov 2026. Official deadline: before the end of November 2026 (12 days of buffer).
Quality bar: Never below the tutor's benchmark. Everything in the "Done when" lists is mandatory; stretch items are added on top.

1. Overview
Event Ticketing and Booking is a full-stack web platform. Organizers publish events. Attendees buy tickets. Staff check people in with QR codes. It is built over nine Build milestones with an AI coding tool as a partner. The graded skill is not typing code: it is knowing what to ask for and knowing whether what came back is correct.

The finished product has a website (HTML, CSS, JavaScript, no framework), a JavaScript API on Node.js, and a SQLite database. Payments are simulated; no real money moves. No outside packages are used anywhere.

How this PRD is used. It restates the tutor's requirements as one product definition, adds the numeric values the tutor left open (clearly marked as assumptions in section 11), and lists the above-benchmark work that makes the project portfolio-ready. If this PRD ever disagrees with the tutor's files, the tutor's files win.

2. Problem statement: the three hard problems
The app looks simple. It hides three hard problems, and solving them well is the point of the project.

#	Problem	What must be true	Solved in
1	Overselling	One ticket left, fifty people press Buy at the same moment. Exactly one gets it. Seats sold never exceed capacity.	Build 5 (S08)
2	Refunds	Money returned depends on how close the event is. Seats are released exactly once, even if the user cancels twice.	Build 8 (S09, S10)
3	Waitlists	When a sold-out tier frees a seat, the person who has waited longest is offered it for a limited time, then it passes to the next person.	Build 8 (S11, S12)
3. Goals, non-goals and success criteria
3.1 Goals
Deliver all 16 backlog stories (S01 to S16) with passing tests, reachable through the API and, where applicable, the screen.
Prove correctness of the three hard problems with automated tests that fail if the fix is removed.
Keep the architecture layered: routes call services, services call rules and repositories, nothing calls upwards.
Ship nine merged pull requests (build-1 to build-9) and an honest docs/ai-log.md with at least one entry per build.
Finish a demo-ready, portfolio-quality project within 15 days.
3.2 Non-goals
Real payments, real emails or SMS, or any third-party service.
A frontend framework, a build step, an ORM, or any npm dependency.
Multi-currency, tax, seat maps, or a mobile app (per-seat tickets are listed as stretch only).
3.3 Success criteria
Level	Criterion	How it is checked
Benchmark (mandatory)	Every "Done when" bullet of Builds 1 to 9 is true.	Checklist in the Milestones document, section 4
Benchmark (mandatory)	npm test passes; CI is green on main.	GitHub Actions run
Benchmark (mandatory)	50 simultaneous buyers of the last seat: 1 success, 49 SOLD_OUT; test fails without the fix.	npm run oversell, test/oversell.test.js
Above benchmark	Edge-case tests beyond those required; coverage report; security checklist; demo script; README with screenshots.	Section 9
Above benchmark	At least one stretch feature shipped without breaking any benchmark test.	Section 9.2
4. Users and roles
Role	What they can do	What they must not do
Visitor	Browse published events; sign up; log in.	Book, pay, or see any private data.
Organizer	Create, edit and publish/unpublish events and ticket tiers. See bookings for their own events only.	Edit another organizer's event (FORBIDDEN). Scan tickets.
Attendee	Browse and search events, book tickets, pay (mock), cancel and get a refund, join waitlists, see their own tickets.	Create events (FORBIDDEN). Read another attendee's booking. Scan tickets (FORBIDDEN).
Staff	Scan tickets at the door for events they are assigned to. Nothing else.	Anything other than check-in.
Roles are enforced on the server, never only in the page. Signup accepts the roles attendee, organizer or staff (Build 7); a public signup with no role defaults to attendee (S01).

5. Scope
In scope (baseline, mandatory)	Stretch (above benchmark, optional)	Out of scope
S01 to S16 as written in the User Stories document.
Nine builds, nine pull requests.
Mock payment gateway with refund.
SQLite storage and the atomic overselling fix.
Refund policy, waitlist, hold expiry, maintenance job.
Signed QR tickets, staff check-in, security headers, rate limiting, CI.	Organizer sales dashboard.
Organizer cancels the whole event (refund everyone).
Promo codes.
Waitlist notifications (in-app).
Partial refunds.
Per-seat tickets.
These six are the tutor's own stretch list.	Real payment providers.
Email/SMS delivery.
Third-party packages.
Frontend frameworks.
Hosting/production deployment (a demo run on localhost is enough).
6. Functional requirements
Every requirement traces to a user story. Priorities follow the tutor's backlog (Must / Should).

ID	Requirement	Story	Build	Pri.
FR-01	A visitor signs up with a new email and a password of at least 8 characters; an attendee account is created; the password is stored only as a salted hash; a signed token is returned. A repeated email gives EMAIL_TAKEN.	S01	7	Must
FR-02	A user logs in with correct credentials and receives a signed token. A wrong password and an unknown email give the same INVALID_CREDENTIALS message.	S01	7	Must
FR-03	A missing, edited or expired token is rejected with UNAUTHENTICATED on every protected request.	S01	7	Must
FR-04	Attendees see only their own bookings; organizers change only their own events; attendees cannot create events.	S13	7	Must
FR-05	An organizer creates an event (title, city, venue, valid date). It is saved as a draft with a new id and is not on the public list. Invalid input gives VALIDATION and saves nothing.	S02	2, 4, 7	Must
FR-06	An organizer adds tiers with a whole-number price (cents/kobo) and capacity of at least 1. A new tier has 0 sold. Unknown event gives NOT_FOUND.	S03	2, 4, 7	Must
FR-07	An organizer publishes and unpublishes an event. Publishing an event with no tiers gives INVALID_STATE. Drafts are hidden from the public list.	S04	2, 4, 7	Must
FR-08	An organizer sees bookings for their own events only.	README	7	Must
FR-09	Attendees search by text (title or venue), filter by city, date range, maximum price and availability, and sort by date, price or availability, using our own stable merge sort. Inputs are never changed.	S05	2, 4, 6	Must
FR-10	An attendee books 1 to 10 tickets from one tier of a published event. A pending booking is created, priced in whole cents. Not enough seats gives SOLD_OUT and changes nothing.	S06	2, 4, 6	Must
FR-11	Seat reservation is a single atomic database statement. 50 simultaneous buyers of 1 seat give 1 success and 49 SOLD_OUT.	S08	5	Must
FR-12	An attendee pays a pending booking with a mock card. Success makes it paid and shows the reference. A decline gives PAYMENT_DECLINED and the booking stays pending. Paying a cancelled booking gives INVALID_TRANSITION. A paid booking is charged only once.	S07	4, 6	Must
FR-13	A cancelled paid booking is refunded by policy (see section 7) and its seats are released exactly once. Cancelling twice is rejected without a second release.	S09	8	Must
FR-14	Pending bookings older than the hold time are cancelled by the maintenance job and their seats released once. Paying an expired booking gives BOOKING_EXPIRED. Paid bookings are untouched.	S10	8	Must
FR-15	An attendee joins the waitlist of a sold-out tier at the end of the line. A tier with seats gives NOT_SOLD_OUT; a repeat join gives ALREADY_ON_WAITLIST.	S11	8	Should
FR-16	When seats are freed, the first person waiting is offered them and the seats are held for them. If the offer expires the seats pass to the next person. Accepting late gives OFFER_EXPIRED.	S12	8	Should
FR-17	Every paid booking has a signed QR ticket containing only the booking reference and issued-at time.	S14	9	Must
FR-18	Staff scan a ticket for an event they are assigned to; the booking becomes checked in and the time is recorded. A code for a different event is rejected. An attendee scanning gets FORBIDDEN.	S14	9	Must
FR-19	Edited or made-up codes are INVALID; duplicates are rejected and show when first used; cancelled or refunded bookings are rejected; two simultaneous scans admit exactly one.	S15	9	Must
FR-20	npm test runs every test and fails if any fails; a push to GitHub runs it automatically.	S16	2, 9	Should
FR-21	The server answers GET /health with {"status":"ok"}, serves static files from public/ without letting a path escape, and returns every error in one shape.	Build 3	3	Must
FR-22	Security headers (CSP without inline scripts, X-Content-Type-Options, Referrer-Policy) and per-IP rate limiting on login and check-in.	Build 9	9	Must
7. Business rules
Rule	Value	Source
Tickets per booking	1 to 10, from one tier. 0, negative, fractional or more than 10 gives VALIDATION.	Build 1, S06
Money	Whole numbers of the smallest unit (kobo or cents). Never decimals. Refunds use Math.floor on cents.	README, Build 8
Refund: 7 days or more before start	100% of the amount paid.	Build 8
Refund: 2 days or more, under 7 days	50% of the amount paid.	Build 8
Refund: under 2 days	0%. Seats are still released.	Build 8
Refund boundaries	An exact boundary belongs to the better tier (exactly 7 days = 100%, exactly 2 days = 50%). An event that has started gives EVENT_STARTED.	Build 8
Booking states	pending, paid, cancelled, refunded, checked_in. Allowed moves: pending to paid or cancelled; paid to checked_in, refunded or cancelled. cancelled, refunded and checked_in are final.	Build 3
Seat release	Exactly once per booking, enforced by a compare-and-set on the booking status.	Build 8
Waitlist	First in, first out. An offer holds the seats. An expired offer passes to the next person.	Build 1, 8
Hold time (unpaid bookings)	15 minutes (assumption A1, configurable).	Open in tutor files
Waitlist offer time	30 minutes (assumption A2, configurable).	Open in tutor files
Publishing	An event needs at least one tier to be published.	Build 2
Passwords / tokens	scrypt with random salt; HS256 tokens that expire; ticket tokens use a different secret.	Build 7, 9
8. Non-functional requirements
Area	Requirement
Stack	Frontend: HTML, CSS, JavaScript (no framework). Backend: Node.js 22.13 or newer. Database: SQLite via node:sqlite. Tests: Node's built-in test runner. No outside packages.
Correctness	A failed operation changes nothing. Seats are never oversold or released twice. All input is validated and rejected with a DomainError that carries a code.
Security	Parameterised SQL only (placeholders). No secrets, passwords or .env files in Git. No personal data in QR codes. A stack trace never reaches the client. Frontend uses textContent, never innerHTML, for data.
Reliability	Data survives a server restart. A maintenance job (setInterval) expires holds and offers; tests call it directly with a controllable clock.
Performance	Booking reference lookup in O(1) (Map, later a UNIQUE index). Merge sort is O(n log n) and stable. Benchmark script shows Map vs Array.find.
Accessibility	Every form control has a label; buttons for actions, links for navigation; sold-out state is shown in text, not colour alone; countdowns are readable by assistive tech.
Maintainability	Layered code; business rules never in route handlers; one money-format function; all browser data access in one file (api.js).
Process	Branch build-N, pull request into main, merge. Never push straight to main. AI log entry in every build.
9. Above the benchmark (portfolio plan)
The tutor allows work above the benchmark but not below it. The plan has two layers: quality extras that cost little and are done inside the 15 days, and stretch features that are only started once Build 9's "Done when" list is fully ticked.

9.1 Quality extras (inside the 15 days)
Extra edge-case tests: concurrency on payment (double pay), refund at every boundary, token with wrong algorithm, path traversal on static files.
Test coverage report using Node's built-in coverage flag; screenshot the result for the README.
docs/security-checklist.md and .env.example written carefully (required by Build 9, polished for portfolio).
A README written for a stranger: what it is, screenshots, how to run, how to test, the three hard problems and how each was solved.
A 5-minute demo script and the "the AI got this wrong" story prepared from the AI log.
9.2 Stretch features (after Build 9 is complete)
ID	Feature (tutor's stretch list)	Value for portfolio	Risk	Order
X01	Organizer sales dashboard (tickets sold, revenue, per-tier fill rate, check-ins)	High: visual, shows SQL aggregation	Low	1st
X02	Organizer cancels the whole event (all paid bookings refunded 100%, seats released once, waitlist closed)	High: reuses refund and state machine	Medium	2nd
X03	Promo codes (percent off, expiry, usage limit)	Medium: touches pricing and refund maths	Medium	3rd
X04	In-app waitlist notifications	Medium	Low	Optional
X05	Partial refunds	Low: policy complexity	High	Skip unless time
X06	Per-seat tickets	Medium but large rewrite of inventory	High	Skip
Rule for stretch work: every stretch feature gets its own branch (for example stretch-dashboard), its own tests and its own AI log entry, and is merged only if all benchmark tests still pass.

10. Error code catalogue
Every error uses one shape: {"error":{"code","message"}}. Codes come from the tutor's files; the two marked * are named by us because the tutor describes the behaviour but not the code.

Code	Meaning	Typical HTTP
VALIDATION	Input is missing, malformed or out of range	400
NOT_FOUND	Record does not exist (or is not yours to see, see A5)	404
SOLD_OUT	Not enough seats in the tier	409
INVALID_STATE	Action not allowed in the current state (e.g. publish with no tiers)	409
INVALID_TRANSITION	Illegal booking state change (e.g. pay a cancelled booking)	409
PAYMENT_DECLINED	Mock card declined; booking stays pending	402
BOOKING_EXPIRED	Booking passed its hold time	410
EVENT_STARTED	Refund requested after the event began	409
NOT_SOLD_OUT	Tried to join a waitlist while seats remain	409
ALREADY_ON_WAITLIST	Repeat join of the same waitlist	409
OFFER_EXPIRED	Waitlist offer accepted after the deadline	410
EMAIL_TAKEN	Signup with a registered email	409
INVALID_CREDENTIALS	Wrong password or unknown email (same message)	401
UNAUTHENTICATED	Missing, edited or expired token	401
FORBIDDEN	Logged in but the role or ownership is wrong	403
INVALID	QR code edited or made up (check-in)	422
DUPLICATE_SCAN*	QR code already used; response shows first-use time	409
RATE_LIMITED*	Too many login or check-in attempts from one IP	429
11. Assumptions and open questions
The tutor's files leave these points open. Each has a default so work is never blocked; items marked Ask are worth a quick confirmation with the tutor.

#	Topic	Default decision	Ask?
A1	Unpaid hold time	15 minutes, constant in src/config.js.	No
A2	Waitlist offer time	30 minutes, constant in src/config.js.	No
A3	Token lifetime	24 hours for login tokens.	No
A4	Waitlist entry quantity	1 to 10 seats, same limits as a booking.	No
A5	Another user's booking: FORBIDDEN or NOT_FOUND? The S13 criterion says FORBIDDEN, the Build 7 prompt says NOT_FOUND.	Follow the acceptance criterion (FORBIDDEN) because tests are written from criteria; keep the choice in one place so it is a one-line change.	Ask
A6	Which final state after a paid cancel?	Refund above 0: refunded. Refund of 0%: cancelled. Unpaid cancel and expiry: cancelled.	Ask
A7	Staff assignment	A staff_assignments table links staff to events; organizers assign staff to their own events.	Ask
A8	Files not in the zip	docs/debugging-exercise.md (Build 8) and public/js/qr.js (Build 9) are promised by the instructor later. Plan assumes they arrive before Day 12 and Day 14.	Ask
A9	Rate-limit numbers	10 login attempts and 30 check-in attempts per IP per minute.	No
A10	S04 acceptance criteria	S04 acceptance criteria were left for students to write; ours are in the User Stories document.	No
12. Risks and mitigation
Risk	Impact	Mitigation
15 days is tighter than the tutor's 9 weeks	High	Day-by-day plan with a checkpoint each day; stretch work only after Build 9; 12 days of buffer before the real deadline.
AI output looks right but is wrong (for example a lock variable instead of an atomic UPDATE)	High	Read every diff; run the "Done when" checks; write the AI log entry the same day.
Concurrency tests that pass by luck	High	Every concurrency test is run once with the fix removed to prove it fails.
node:sqlite is synchronous, so a race may not appear	Medium	Keep repository methods async with an await between check and write in the unfixed demo so the problem is visible; then fix with one atomic UPDATE.
Instructor files arrive late (debugging exercise, qr.js)	Medium	Build everything else first; leave those two tasks last in their days.
Scope creep from stretch ideas	Medium	Stretch is blocked until all Build 9 boxes are ticked.
Secrets committed by accident	High	.gitignore already lists .env and *.db; only .env.example is committed.
13. Delivery plan and submission
The full day-by-day schedule is in the Milestones document. In summary: Builds 1 to 3 in Days 1 to 4, Builds 4 to 5 in Days 5 to 7, Build 6 in Days 8 to 9, Build 7 in Days 10 to 11, Build 8 in Days 12 to 13, Build 9 and final polish in Days 14 to 15.

Submission checklist
Nine pull requests merged into main (build-1 to build-9), none pushed straight to main.
docs/ai-log.md with at least one real entry in every build, including at least one "the AI got this wrong" story.
docs/architecture.md with three Mermaid diagrams (layers, data model, booking life cycle) and one sentence per layer.
docs/api-examples.md, docs/security-checklist.md, .env.example, .github/workflows/ci.yml, docs/debugging-exercise write-up.
npm test green locally and in CI; npm run demo, npm run benchmark, npm run oversell work.
No secrets in Git history. Submit before the end of November 2026 (target: 18 November).
