## Milestones: Nine Builds in 15 Days
Tutor's nine milestones, compressed into a day-by-day plan from 4 to 18 November 2026

Document: Milestones (3 of 4: PRD, User Stories, Milestones, Architecture)
Version / date: 1.0 — 3 November 2026
Author: [Elias Ademu Israel] — individual project
Source of truth: docs/milestones.md and docs/build-1.md to build-9.md. Milestone names, stories, deliverables and "Done when" lists are the tutor's, word for word where quoted.
Timeline: Day 1 = Wed 4 Nov 2026. Day 15 = Wed 18 Nov 2026. Buffer and stretch window: 19 to 30 Nov. Official deadline: before the end of November 2026.
Assumed effort: About 6 focused hours per working day, including weekends (assumption). The tutor planned one build per week; this plan runs roughly 4 times faster.
1. The nine Builds at a glance
Each Build ends with something you can run and show. A Build starts from the finished state of the one before it, so main must always work.

Build	Course week	Milestone	Stories	Planned days
1	4	Domain core in the terminal	none (groundwork)	Day 1
2	5	Event search, sorting, backlog, first tests	S02, S03, S04, S05, S06, S16	Days 2 to 3
3	6	Architecture, state machine, server skeleton	none (groundwork)	Day 4
4	7	Working REST API (in memory)	S02, S03, S04, S05, S06, S07	Days 5 to 6
5	8	SQLite and the overselling fix	S08	Day 7
6	9	Frontend on mock data	S05, S06, S07	Days 8 to 9
7	10	Login, roles and a connected app	S01, S13, S02, S03, S04	Days 10 to 11
8	11	Refunds, waitlist, expiry, real test suite	S09, S10, S11, S12	Days 12 to 13
9	12	QR check-in, CI, security, demo-ready	S14, S15, S16	Days 14 to 15
Every Build follows four steps: (1) Gap lesson: learn what is new. (2) Prompt and build: give the AI a clear description and let it write a first draft. (3) Review: read the code, run it, decide what is wrong, fix it, and tell the AI why. (4) Ship: commit on branch build-N, open a pull request into main, merge it. Add at least one entry to docs/ai-log.md in every build.

About the tutor's sample code. The zip contains Build 1 sample code (src/domain, scripts). It was classroom illustration, so it is not reused. It may be read to understand the idea, but our repository starts empty and every file is produced from the Build prompts.

2. The 15-day schedule
Day	Date	Build	Work for the day	End-of-day proof
1	Wed 4 Nov	1	Create repo and build-1 branch; check node --version is 22.13+; add README, .gitignore, docs/ai-log.md. Run Build 1 prompt; review errors.js, ids.js, waitlistQueue.js, inventory.js; write demo and benchmark scripts. Merge PR.	npm run demo tells the full story; npm run benchmark shows Map far faster than Array.find; PR merged.
2	Thu 5 Nov	2	Write the S04 criteria yourself first. Then: sorting.js (own stable merge sort, no Array.sort), publishEvent, listEventSummaries, eventSearch.js (filter, sort, search).	Search/filter/sort work and never change the original list.
3	Fri 6 Nov	2	Tests with node:test for S02, S03, S04, S05, S06 (one per criterion plus edge cases). Add npm test. AI log entries. Merge PR.	npm test passes; every Build 2 story has acceptance criteria.
4	Sat 7 Nov	3	docs/architecture.md with three Mermaid diagrams (copy from Architecture PDF), bookingStateMachine.js, router.js, app.js, server.js, config.js, tests (every legal and illegal move, router, real /health call).	Server starts, /health responds; paying a cancelled booking is refused by a test.
5	Sun 8 Nov	4	memory.js repository, eventService, bookingService, mockPaymentGateway, all routes (events, tiers, publish, list, book, pay, cancel). x-user-id header for now.	Create, publish, book and pay all work with curl.
6	Mon 9 Nov	4	docs/api-examples.md (one curl per call, in order create, publish, book, pay); API tests on a real server on a free port; S07 criteria. Merge PR.	Every call in api-examples.md works; errors always have the same shape.
7	Tue 10 Nov	5	schema.sql with constraints, connection.js, sqlite.js repository, seed.js. Prompt 1: oversell-demo.js and watch it fail. Prompt 2: atomic UPDATE fix, oversell.test.js. Remove the fix once to prove the test fails. Restart server to prove persistence. Merge PR.	50 buyers, 1 seat: exactly 1 success. Test fails without fix. Data survives restart.
8	Wed 11 Nov	6	index.html, styles.css, ui.js (el helper, textContent only), mockData.js, api.js (mock), home.js with search, city filter, max price, sort. One price-format function.	Browse, filter and sort work on mock data.
9	Thu 12 Nov	6	event.html, event.js: tiers, quantity picker (max 10 or seats left), sold-out marking, checkout with countdown, mock card with decline and retry; labels and keyboard check. Merge PR.	Browse, filter, book and "pay" in the browser; sold-out tier is blocked; declined card allows retry.
10	Fri 13 Nov	7	password.js (scrypt), token.js (HS256, expiry, alg check), authService, auth routes, guards (requireUser, requireRole), ownership checks, replace x-user-id. Tests: signup, login, bad token, expired token, wrong role, other's booking.	Backend auth tests pass.
11	Sat 14 Nov	7	Real fetch-based api.js, session.js, login.html, tickets.html, organizer.html, loading and error states. Full browser path: organizer publishes, attendee books and pays. Merge PR.	Organizer-to-attendee path works in the browser; cross-user access is blocked.
12	Sun 15 Nov	8	clock.js, refundPolicy.js, cancel paid booking with compare-and-set, mock gateway refund, seatService, maintenance.js (expire holds), tests for every refund boundary and cancel twice. Read debugging-exercise.md if the instructor has issued it.	Refund tests and expiry tests pass.
13	Mon 16 Nov	8	waitlistService, join and accept routes, timed offers passing to the next person, UI (refund amount before confirm, Join waitlist, offer countdown + Accept), full test suite, debugging exercise write-up. Merge PR.	All Build 8 "Done when" items true; write-up complete.
14	Tue 17 Nov	9	ticketToken.js (HMAC-SHA256, separate secret), QR on tickets.html using vendored qr.js, checkinService, POST /api/checkin, checkin.html, securityHeaders.js, rateLimit.js, tests (forged, duplicate, cancelled, wrong role, two simultaneous scans).	Check-in works; second scan rejected; simultaneous scans admit one.
15	Wed 18 Nov	9	ci.yml, security-checklist.md, .env.example, PR and merge. Confirm CI is green. Final README with screenshots, demo rehearsal, "the AI got this wrong" story, last read of the master checklist (section 4).	Full path in the browser; npm test green locally and on GitHub. Baseline complete.
Checkpoints and catch-up rules
Day 7 checkpoint (end of Build 5): the hardest backend problem is solved. If you are more than half a day late, cut the Day 8 to 9 styling polish, never a test.
Day 11 checkpoint (end of Build 7): the whole app works in the browser. If late, move extra edge-case tests to the buffer window.
Order of cuts if time runs short: (1) stretch features, (2) README screenshots, (3) extra edge-case tests, (4) visual polish. Never cut: any "Done when" item, any acceptance criterion, the AI log, or the pull-request workflow.
Days with instructor dependencies: debugging-exercise.md (Days 12 to 13) and public/js/qr.js (Day 14). If either has not arrived, do the rest of that day first and ask the tutor.
3. Build-by-build milestone cards
Build 1: Domain core in the terminal
Course week 4 · Stories: none (groundwork); prepares S02, S03, S06 · Planned: Day 1

Item	Detail
You deliver	Events, ticket tiers, bookings with a capacity rule, a first-in-first-out waitlist, and fast lookup of a booking by its reference code. Runs in the terminal; no server, no database.
You practise	Functions and objects, Map, a queue built as a linked list, Big O, errors, Git.
Files expected	src/domain/errors.js, ids.js, waitlistQueue.js, inventory.js; scripts/demo.js, scripts/benchmark-lookup.js; package.json with "demo" and "benchmark".
Done when (tutor)	☐ npm run demo prints the whole story: an event sells out, a booking is refused, people join the waitlist, a booking is cancelled, and the next person in line is named.
☐ npm run benchmark shows a Map lookup far faster than Array.find, and you can explain why in Big O terms.
☐ Your first pull request is merged.
Above benchmark	Write a short Big O note (O(1) vs O(n)) in the AI log; double BOOKINGS and record which number grows and which stays flat.
Git	Branch build-1 → pull request into main → merge. At least one AI-log entry.
Build 2: Event search, sorting, backlog, first tests
Course week 5 · Stories: S02, S03, S04, S05, S06, S16 · Planned: Days 2 to 3

Item	Detail
You deliver	Search and filter events by text, city, date range and price; sort by date, price or availability using a merge sort you write yourself; the backlog written as user stories; your first automated tests.
You practise	Sorting algorithms, stability, Big O, Agile and Scrum, user stories with acceptance criteria.
Files expected	src/domain/sorting.js, eventSearch.js, publishEvent and listEventSummaries in inventory.js; test/ (node:test); "test" script.
Done when (tutor)	☐ Search, filter and sort work and never change the original list.
☐ Every user story you are building has acceptance criteria.
☐ npm test runs and passes.
Above benchmark	Stability test on 1,000 random items; empty-list and every-error-code tests; test-name labels that match the story criteria IDs.
Git	Branch build-2 → pull request into main → merge. At least one AI-log entry.
Build 3: Architecture, state machine, server skeleton
Course week 6 · Stories: none (groundwork); prepares S07, S09, S10 · Planned: Day 4

Item	Detail
You deliver	A layered design (routes, services, rules, data), the booking life cycle as an explicit state machine, and a web server that answers /health and serves static files.
You practise	Requirements, system architecture, state diagrams, HTTP basics.
Files expected	docs/architecture.md (3 Mermaid diagrams + one sentence per layer), src/domain/bookingStateMachine.js, src/http/router.js, app.js, src/server.js, src/config.js, "start" script.
Done when (tutor)	☐ A diagram of your architecture and your booking states is in docs/.
☐ Invalid state changes (for example paying a cancelled booking) are refused by tests.
☐ The server starts and /health responds.
Above benchmark	Path-traversal test on static files; JSON 404 and 400 shapes tested; no stack trace ever reaches the client.
Git	Branch build-3 → pull request into main → merge. At least one AI-log entry.
Build 4: Working REST API (in memory)
Course week 7 · Stories: S02, S03, S04, S05, S06, S07 · Planned: Days 5 to 6

Item	Detail
You deliver	An API that works end to end with data in memory: create events and tiers, publish, search, book, pay with a mock payment, and cancel an unpaid booking.
You practise	REST design, status codes, validation, async/await, separating routes from rules.
Files expected	src/repositories/memory.js, services/eventService.js, bookingService.js, lib/mockPaymentGateway.js, routes, docs/api-examples.md, API tests.
Done when (tutor)	☐ Every call in docs/api-examples.md works with curl.
☐ Errors always come back in the same shape.
☐ npm test includes API-level tests.
Above benchmark	Test that a booking can only be paid by its owner; double-pay charges once; declined card leaves booking pending.
Git	Branch build-4 → pull request into main → merge. At least one AI-log entry.
Build 5: SQLite and the overselling fix
Course week 8 · Stories: S08 · Planned: Day 7

Item	Detail
You deliver	Data stored in SQLite, and the last-ticket problem reproduced and then fixed.
You practise	SQL, constraints, parameterised queries, atomic operations, concurrency.
Files expected	src/db/schema.sql, connection.js (node:sqlite), repositories/sqlite.js, scripts/seed.js, scripts/oversell-demo.js, test/oversell.test.js, "seed" and "oversell" scripts.
Done when (tutor)	☐ A script shows 50 people trying to buy the last ticket, and exactly one succeeds.
☐ A test proves it, and fails if the fix is removed.
☐ Data survives a server restart.
Above benchmark	Keep before/after numbers of the demo for the README; variants with 5 seats and mixed quantities; explain in two sentences why a lock variable and check-twice do not work.
Git	Branch build-5 → pull request into main → merge. At least one AI-log entry.
Build 6: Frontend on mock data
Course week 9 · Stories: S05, S06, S07 · Planned: Days 8 to 9

Item	Detail
You deliver	A website to browse, filter and sort events, view an event, choose tickets, check out with a countdown, and pay with a mock card, on fake data for now.
You practise	The DOM, forms, ES modules in the browser, accessibility basics, keeping all data access in one file.
Files expected	public/index.html, event.html, js/ui.js, mockData.js, api.js, pages/home.js, event.js, css/styles.css.
Done when (tutor)	☐ You can browse, filter, book and "pay" in the browser.
☐ A sold-out tier is clearly marked and cannot be booked.
☐ A declined card shows an error and lets you try again.
Above benchmark	Responsive layout check on a phone-width window; keyboard-only run-through; screenshots saved for the README.
Git	Branch build-6 → pull request into main → merge. At least one AI-log entry.
Build 7: Login, roles and a connected app
Course week 10 · Stories: S01, S13, S02, S03, S04 · Planned: Days 10 to 11

Item	Detail
You deliver	Signup and login with safely stored passwords and signed tokens, three roles, checks that people only see their own data, and the website talking to the real API. New pages: login, my tickets, organizer dashboard.
You practise	fetch, loading and error states, authentication versus authorization, password hashing, tokens.
Files expected	src/lib/password.js, token.js, services/authService.js, routes/auth.js, http/guards.js, public/js/session.js, login.html, tickets.html, organizer.html.
Done when (tutor)	☐ You can sign up as an organizer, publish an event, then sign up as an attendee, book and pay, all in the browser.
☐ One attendee cannot read another attendee's booking, and one organizer cannot edit another organizer's event.
☐ npm test includes login, bad-token and wrong-role tests.
Above benchmark	Test that a token with another algorithm in its header is rejected; test that password never appears in any response; decide A5 (FORBIDDEN vs NOT_FOUND) with the tutor.
Git	Branch build-7 → pull request into main → merge. At least one AI-log entry.
Build 8: Refunds, waitlist, expiry, real test suite
Course week 11 · Stories: S09, S10, S11, S12 · Planned: Days 12 to 13

Item	Detail
You deliver	A refund policy based on time to the event, cancelling and refunding paid bookings, a waitlist with timed offers, unpaid bookings that expire and release their seats, and a test suite that proves each rule. You finish with a debugging exercise.
You practise	Unit and integration tests, boundary cases, a controllable clock, scheduled jobs, debugging method.
Files expected	src/lib/clock.js, domain/refundPolicy.js, services/seatService.js, waitlistService.js, jobs/maintenance.js, UI changes, tests, docs/debugging-exercise.md write-up.
Done when (tutor)	☐ Tests cover every refund boundary, cancelling twice, waitlist order, an offer expiring and passing to the next person, and an unpaid hold expiring.
☐ The website shows the refund amount before you confirm a cancel, offers "Join waitlist" on sold-out tiers, and shows offers with a countdown.
☐ Your debugging exercise write-up is complete.
Above benchmark	Simultaneous-cancel test (seats released once); a real hold test (a new buyer cannot take a held seat); the debugging write-up follows a method: reproduce, isolate, hypothesise, fix, prove.
Git	Branch build-8 → pull request into main → merge. At least one AI-log entry.
Build 9: QR check-in, CI, security, demo-ready
Course week 12 · Stories: S14, S15, S16 · Planned: Days 14 to 15

Item	Detail
You deliver	A signed QR code for every paid booking, staff check-in, rejection of forged and repeated scans, security headers and rate limiting, automated tests on every push, and a project ready to demo.
You practise	Signing and verification, continuous integration, web security basics, handling secrets.
Files expected	src/lib/ticketToken.js, services/checkinService.js, POST /api/checkin, public/checkin.html, vendored public/js/qr.js, http/securityHeaders.js, lib/rateLimit.js, .github/workflows/ci.yml, docs/security-checklist.md, .env.example.
Done when (tutor)	☐ The full path works in the browser: organizer publishes, attendee books, pays and sees a QR code, staff scans it, and a second scan is rejected.
☐ npm test passes, including forged-code, duplicate-scan and simultaneous-scan tests.
☐ A push to GitHub runs the tests automatically and they pass.
☐ You have one "the AI got this wrong" story ready for the demo.
Above benchmark	Failing-CI screenshot on a throwaway branch; secrets scan of Git history before the final push; 5-minute demo script.
Git	Branch build-9 → pull request into main → merge. At least one AI-log entry.
4. Master "Done when" checklist
Tick every box on Day 15. A box that cannot be ticked means the project is below the benchmark. This is the check referred to in the PRD.

Build	Item	Done
1	npm run demo prints the whole story	☐
1	npm run benchmark shows Map far faster than Array.find; Big O explained	☐
1	First pull request merged	☐
2	Search, filter and sort work and never change the original list	☐
2	Every story built has acceptance criteria	☐
2	npm test runs and passes	☐
3	Diagram of architecture and booking states is in docs/	☐
3	Invalid state changes refused by tests	☐
3	Server starts and /health responds	☐
4	Every call in docs/api-examples.md works with curl	☐
4	Errors always come back in the same shape	☐
4	npm test includes API-level tests	☐
5	Script: 50 people try the last ticket, exactly one succeeds	☐
5	Test proves it and fails if the fix is removed	☐
5	Data survives a server restart	☐
6	Browse, filter, book and "pay" in the browser	☐
6	Sold-out tier clearly marked and cannot be booked	☐
6	Declined card shows an error and allows retry	☐
7	Organizer-to-attendee full path works in the browser	☐
7	Cross-user access blocked (attendee booking, organizer event)	☐
7	npm test includes login, bad-token and wrong-role tests	☐
8	Tests cover refund boundaries, cancel twice, waitlist order, offer expiry and pass-on, hold expiry	☐
8	Website shows refund amount before confirm, Join waitlist, offers with countdown	☐
8	Debugging exercise write-up complete	☐
9	Full path in the browser including QR scan and rejected second scan	☐
9	npm test passes incl. forged, duplicate and simultaneous scans	☐
9	Push to GitHub runs tests automatically and they pass	☐
9	One "the AI got this wrong" story ready	☐
All	Nine PRs merged; AI log has at least one entry per build; no secrets in Git	☐
5. Buffer and stretch window (19 to 30 November)
Everything below happens only after the master checklist is fully ticked. Stretch items are the tutor's own list; see the PRD (section 9) and User Stories (section 6).

Dates	Item	Branch	Exit
Thu 19 to Fri 20 Nov	X01 Organizer sales dashboard	stretch-dashboard	Tests pass; screenshot for README
Sat 21 to Mon 23 Nov	X02 Organizer cancels whole event	stretch-cancel-event	Refunds once, seats released once, waitlist closed
Tue 24 to Thu 26 Nov	X03 Promo codes (only if X01 and X02 are done)	stretch-promo	Refund uses amount actually paid
Fri 27 Nov	Freeze. Final test run, CI green, README and screenshots updated, secrets check	main	Tag release v1.0
Sat 28 to Mon 30 Nov	Spare days. Submit by Sat 28 Nov at the latest.	—	Submitted
Submission timing: the tutor's deadline is before the end of November. Decide on Day 15 whether to submit the finished baseline on 18 November, or hold the submission to include stretch work. If a resubmission is not allowed, submit only after the freeze on 27 November.

6. Pull request and AI log routine
Step	What to do	When
Branch	git switch -c build-N from an up-to-date main	Start of the build
Prompt	Give the AI the files the build's prompt lists, then paste the prompt	After reading build-N.md
Review	Read every changed file; run the "Done when" checks; list what is wrong	Before the first commit of AI code
Log	Add entries to docs/ai-log.md: what you asked, what came back, what was wrong (or "nothing") and what you changed	Same day, while fresh
Commit	Small commits with clear messages; never commit .env, passwords or *.db	Throughout
Pull request	Open into main with a short description and the "Done when" checklist; merge only when it passes	End of the build
7. Glossary (tutor's terms)
Term	Meaning in this course
Build	One weekly class session. It ends with something you can run and show.
Milestone	The one thing a Build must deliver.
Sprint	A short, fixed period of work. Each Build is one sprint.
Backlog	Every story we might build, with its priority.
User story	One sentence: "As a (who), I want to (what), so that (why)."
Acceptance criterion	A Given/When/Then sentence that says exactly when a story passes.
Test	Code that checks one acceptance criterion and fails if it is not met.
Definition of done	The checklist every story must pass before it is finished.
Pull request	A request to merge your build-N branch into main, so someone can review it first.
AI log	docs/ai-log.md. For each prompt: what you asked, what came back, and what was wrong.
Stable sort	A sort that keeps equal items in their original order.
Pure function	Same input, same output, and nothing outside it changes.
State machine	A list of states and the only moves allowed between them.
Idempotent	Doing it twice has the same effect as doing it once.