## Product Backlog: User Stories
Sixteen stories, every acceptance criterion in Given / When / Then form

Document: User Stories (2 of 4: PRD, User Stories, Milestones, Architecture)
Version / date: 1.0 — 3 November 2026
Author: [Your Name] — individual project
Source of truth: docs/user-stories.md and the "User stories in this build" section of docs/build-2.md to build-9.md. Story IDs, wording, priorities and criteria are the tutor's. Additions are labelled.
Labels used: Tutor = copied from the tutor's files. Drafted = written by the student where the tutor asked for it (S04). Extra = above-benchmark additions.
1. Roles
Role	Does
Organizer	Creates, edits and publishes events and ticket tiers
Attendee	Browses, books, pays, cancels, joins waitlists
Staff	Checks people in at the door
Format of every story: "As a (who), I want to (what), so that (why)." Format of every criterion: Given a starting situation, When something happens, Then the exact result. Each criterion becomes at least one automated test.

2. Product backlog
Each Build is one sprint. The Build column says which build finishes the story end to end (rules, API and screen where it applies).

ID	As a...	I want to...	So that...	Pri.	Build
S01	visitor	sign up and log in	my bookings are private	Must	7
S02	organizer	create an event with title, city, venue and date	people can find it	Must	2 (rules), 4 (API), 7 (screen)
S03	organizer	add ticket tiers with a price and capacity	I can sell different kinds of ticket	Must	2, 4, 7
S04	organizer	publish and unpublish an event	I control when it goes public	Must	2, 4, 7
S05	attendee	search, filter and sort published events	I can find one I like	Must	2, 4, 6
S06	attendee	book a number of tickets from a tier	I get a place	Must	2, 4, 6
S07	attendee	pay for a booking (mock payment)	the booking is confirmed	Must	4, 6
S08	attendee	be certain the last ticket is sold to only one person	nobody turns up to a full event	Must	5
S09	attendee	cancel a booking and get a refund by the policy	I am not stuck if plans change	Must	8
S10	attendee	have unpaid bookings expire	seats are not locked forever	Must	8
S11	attendee	join a waitlist for a sold-out tier	I can still get a seat if one frees up	Should	8
S12	attendee	be offered a freed seat, in order, for a limited time	the process is fair	Should	8
S13	attendee	see only my own bookings	my data is private	Must	7
S14	staff	scan a ticket's QR code at the door	I can admit the right people	Must	9
S15	staff	have forged and repeated scans rejected	nobody gets in twice or with a fake	Must	9
S16	team	run automated tests on every push	we notice breakage early	Should	2 to 9
Stretch (tutor's list): organizer sales dashboard, per-seat tickets, promo codes, waitlist notifications, partial refunds, organizer cancels the whole event. See section 6.

3. Acceptance criteria
Each story's criteria sit in the Build that first delivers it. The "Test" column is the planned test file and label, so that every criterion is traceable to code.

S01: As a visitor, I want to sign up and log in, so that my bookings are private
Priority: Must · Build 7 · Source: Tutor · Requirements FR-01, FR-02, FR-03

#	Criterion	Test
S01.1	Given a new email and a password of at least 8 characters
When a visitor signs up
Then an attendee account is created, the password is stored only as a hash, and a signed token is returned	auth.test.js signup_ok
S01.2	Given an email that is already registered
When someone signs up with it
Then the request is rejected with EMAIL_TAKEN	auth.test.js email_taken
S01.3	Given correct credentials
When the user logs in
Then a signed token is returned	auth.test.js login_ok
S01.4	Given a wrong password or an unknown email
When someone logs in
Then the request is rejected with INVALID_CREDENTIALS, and the message is the same for both cases	auth.test.js login_same_msg
S01.5	Given a missing, edited or expired token
When any protected request is made
Then it is rejected with UNAUTHENTICATED	auth.test.js bad_token
Extra edge-case tests (above benchmark): password shorter than 8 characters gives VALIDATION; a token whose header says another algorithm than HS256 is rejected; password never appears in any response or log.

S02: As an organizer, I want to create an event with title, city, venue and date, so that people can find it
Priority: Must · Builds 2 (rules), 4 (API), 7 (screen) · Source: Tutor · Requirement FR-05

#	Criterion	Test
S02.1	Given an organizer
When they create an event with a title, city, venue and a valid date
Then the event is saved as a draft with a new id, and it is not on the public list	events.test.js create_draft
S02.2	Given a missing title or city, or a date that is not a real date
When the organizer creates the event
Then the request is rejected with VALIDATION and nothing is saved	events.test.js create_invalid
Extra edge-case tests (above benchmark): date such as 2026-02-30 is rejected; title of only spaces is rejected; two events get two different ids.

S03: As an organizer, I want to add ticket tiers with a price and capacity, so that I can sell different kinds of ticket
Priority: Must · Builds 2, 4, 7 · Source: Tutor · Requirement FR-06

#	Criterion	Test
S03.1	Given a draft event
When the organizer adds a tier "General" at 500000 kobo with capacity 100
Then the tier is saved with 0 sold and 100 seats left	tiers.test.js add_tier
S03.2	Given any event
When the price is not a whole number, or the capacity is less than 1
Then the request is rejected with VALIDATION	tiers.test.js tier_invalid
S03.3	Given an event id that does not exist
When the organizer adds a tier
Then the request is rejected with NOT_FOUND	tiers.test.js tier_no_event
Extra edge-case tests (above benchmark): price 0 allowed (free tier); negative price rejected; capacity 1.5 rejected.

S04: As an organizer, I want to publish and unpublish an event, so that I control when it goes public
Priority: Must · Builds 2, 4, 7 · Source: Drafted (the tutor asked students to write these three criteria in Build 2) · Requirement FR-07

#	Criterion	Test
S04.1	Given a draft event with at least one ticket tier
When the organizer publishes it
Then the event becomes published and appears on the public list	events.test.js publish_ok
S04.2	Given an event with no ticket tiers
When the organizer publishes it
Then the request is rejected with INVALID_STATE and the event stays a draft	events.test.js publish_no_tiers
S04.3	Given a published event
When the organizer unpublishes it
Then it goes back to draft and disappears from the public list, and existing bookings are not changed	events.test.js unpublish
Extra edge-case tests (above benchmark): publishing twice is harmless; another organizer publishing gives FORBIDDEN (Build 7).

S05: As an attendee, I want to search, filter and sort published events, so that I can find one I like
Priority: Must · Builds 2, 4, 6 · Source: Tutor · Requirement FR-09 · Rule: merge sort is written by us, stable, never uses Array.sort

#	Criterion	Test
S05.1	Given events titled "Lagos Tech Meetup" and "Abuja Jazz Night"
When the attendee searches for "JAZZ"
Then only Abuja Jazz Night is returned	search.test.js text_ci
S05.2	Given events in Lagos and Abuja
When the attendee filters by city "lagos"
Then only the Lagos events are returned, whatever the capital letters	search.test.js city_ci
S05.3	Given events with different prices
When the attendee sets a maximum price and sorts by price
Then only events whose cheapest tier is within the maximum are returned, cheapest first, and events with no tiers are left out	search.test.js price_sort
S05.4	Given two events on the same day
When the attendee sorts by date
Then the earlier one comes first, and the two events on the same day stay in title order	search.test.js date_stable
S05.5	Given an event at 5 PM on 5 December
When the attendee filters up to the date 2026-12-05
Then that event is included	search.test.js to_inclusive
S05.6	Given a bad date, a price that is not a whole number, or an unknown sort option
When the attendee searches
Then the request is rejected with VALIDATION	search.test.js validation
S05.7	Given any list of events
When it is searched, filtered or sorted
Then the original list is unchanged	search.test.js no_mutation
Extra edge-case tests (above benchmark): empty list; sort by availability; merge sort stability on 1,000 random items compared with a reference check; combined filters.

S06: As an attendee, I want to book a number of tickets from a tier, so that I get a place
Priority: Must · Builds 2, 4, 6 · Source: Tutor · Requirement FR-10

#	Criterion	Test
S06.1	Given a published event with 3 seats left in General
When an attendee books 2
Then a pending booking is created for 2 seats, priced in whole cents, and 1 seat is left	booking.test.js book_ok
S06.2	Given 1 seat left
When an attendee books 2
Then the booking is rejected with SOLD_OUT and nothing changes	booking.test.js sold_out
S06.3	Given any tier
When the quantity is 0, negative, fractional or more than 10
Then the request is rejected with VALIDATION	booking.test.js qty_invalid
Extra edge-case tests (above benchmark): booking a draft event is rejected; quantity exactly 10 is accepted when seats allow; total = price x quantity in integer cents.

S07: As an attendee, I want to pay for a booking (mock payment), so that the booking is confirmed
Priority: Must · Builds 4, 6 · Source: Tutor · Requirement FR-12

#	Criterion	Test
S07.1	Given a pending booking
When the attendee pays with a valid mock card
Then the booking becomes paid and the reference code is shown	pay.test.js pay_ok
S07.2	Given a pending booking
When the mock card is declined
Then the request is rejected with PAYMENT_DECLINED, the booking stays pending, and the attendee can try again	pay.test.js declined_retry
S07.3	Given a cancelled booking
When someone tries to pay for it
Then the request is rejected with INVALID_TRANSITION	pay.test.js pay_cancelled
S07.4	Given a booking that is already paid
When the attendee pays again
Then the request is rejected and the card is charged only once	pay.test.js double_pay
Extra edge-case tests (above benchmark): a booking can only be paid by the person who made it; two simultaneous pay requests charge once; the gateway never receives a card number.

S08: As an attendee, I want to be certain the last ticket is sold to only one person, so that nobody turns up to a full event
Priority: Must · Build 5 · Source: Tutor · Requirement FR-11 · Hard problem 1: overselling

#	Criterion	Test
S08.1	Given exactly 1 seat left
When 50 attendees try to book it at the same moment
Then exactly 1 booking succeeds, 49 get SOLD_OUT, and seats sold never exceeds capacity	oversell.test.js fifty_for_one
S08.2	Given the database fix is removed
When the overselling test runs
Then the test fails	oversell.test.js proves_fix
Extra edge-case tests (above benchmark): same test with 5 seats and 50 buyers of 1; mixed quantities (2 and 3) against 4 seats; CHECK (sold >= 0 AND sold <= capacity) is the last line of defence. The fix is one atomic UPDATE ... WHERE sold + ? <= capacity and the number of changed rows decides the winner.

S09: As an attendee, I want to cancel a booking and get a refund by the policy, so that I am not stuck if plans change
Priority: Must · Build 8 · Source: Tutor · Requirement FR-13 · Hard problem 2: refunds

#	Criterion	Test
S09.1	Given a paid booking and an event 10 days away
When the attendee cancels
Then 100% is refunded and the seats are released once	refund.test.js days_10
S09.2	Given a paid booking and an event 3 days away
When the attendee cancels
Then 50% is refunded	refund.test.js days_3
S09.3	Given a paid booking and an event 1 day away
When the attendee cancels
Then nothing is refunded, but the seats are still released	refund.test.js days_1
S09.4	Given a booking that is already cancelled or refunded
When the attendee cancels again
Then the request is rejected and the seats are not released a second time	refund.test.js cancel_twice
Extra edge-case tests (above benchmark): boundaries: exactly 7 days (100%), 6 days 23 hours (50%), exactly 2 days (50%), 1 day 23 hours (0%); event already started gives EVENT_STARTED; odd amounts use Math.floor; two simultaneous cancels release seats once (compare-and-set on status).

S10: As an attendee, I want to have unpaid bookings expire, so that seats are not locked forever
Priority: Must · Build 8 · Source: Tutor · Requirement FR-14

#	Criterion	Test
S10.1	Given a pending booking older than the hold time
When the expiry job runs
Then the booking becomes cancelled and its seats are released once	expiry.test.js expire_pending
S10.2	Given an expired booking
When the attendee tries to pay
Then the request is rejected with BOOKING_EXPIRED	expiry.test.js pay_expired
S10.3	Given a paid booking
When the expiry job runs
Then nothing changes	expiry.test.js paid_untouched
Extra edge-case tests (above benchmark): job run twice releases seats once; a booking one second inside the hold time is not expired (controllable clock); freed seats are offered to the waitlist.

S11: As an attendee, I want to join a waitlist for a sold-out tier, so that I can still get a seat if one frees up
Priority: Should · Build 8 · Source: Tutor · Requirement FR-15 · Hard problem 3: waitlists

#	Criterion	Test
S11.1	Given a sold-out tier
When an attendee joins the waitlist
Then they are added at the end of the line	waitlist.test.js join_end
S11.2	Given a tier that still has seats
When an attendee tries to join the waitlist
Then the request is rejected with NOT_SOLD_OUT	waitlist.test.js not_sold_out
S11.3	Given an attendee already on the waitlist
When they join again
Then the request is rejected with ALREADY_ON_WAITLIST	waitlist.test.js already_on
Extra edge-case tests (above benchmark): unauthenticated join gives UNAUTHENTICATED; position is reported to the user.

S12: As an attendee, I want to be offered a freed seat, in order, for a limited time, so that the process is fair
Priority: Should · Build 8 · Source: Tutor · Requirement FR-16

#	Criterion	Test
S12.1	Given three people on the waitlist in order A, B, C
When a seat is freed
Then A (not B or C) is offered it, and the seat is held for A	waitlist.test.js offer_in_order
S12.2	Given A does not accept in time
When the offer expires
Then the seat passes to B	waitlist.test.js offer_passes
S12.3	Given an expired offer
When A tries to accept it
Then the request is rejected with OFFER_EXPIRED	waitlist.test.js accept_late
Extra edge-case tests (above benchmark): while A holds the offer, a new buyer cannot take the seat (real hold); if nobody is left, the seat returns to general sale; an offer expiring twice does not release twice.

S13: As an attendee, I want to see only my own bookings, so that my data is private
Priority: Must · Build 7 · Source: Tutor · Requirement FR-04

#	Criterion	Test
S13.1	Given attendee A has a booking
When attendee B asks for it
Then the request is rejected with FORBIDDEN	access.test.js other_booking
S13.2	Given an attendee
When they ask for the list of bookings
Then only their own bookings are returned	access.test.js list_own
S13.3	Given organizer A's event
When organizer B tries to edit it
Then the request is rejected with FORBIDDEN	access.test.js other_organizer
S13.4	Given an attendee account
When it tries to create an event
Then the request is rejected with FORBIDDEN	access.test.js attendee_create
Open point A5: the Build 7 prompt says another person's booking should give NOT_FOUND, while this criterion says FORBIDDEN. We follow the criterion and keep the choice in a single function so it can change in one line.

S14: As a staff, I want to scan a ticket's QR code at the door, so that I can admit the right people
Priority: Must · Build 9 · Source: Tutor · Requirements FR-17, FR-18

#	Criterion	Test
S14.1	Given a paid booking
When staff scan its QR code
Then the booking is checked in and the time is recorded	checkin.test.js checkin_ok
S14.2	Given a QR code for a different event
When staff scan it at this event
Then it is rejected	checkin.test.js wrong_event
S14.3	Given an attendee account
When it tries to scan a ticket
Then the request is rejected with FORBIDDEN	checkin.test.js wrong_role
Extra edge-case tests (above benchmark): staff not assigned to the event are rejected; a pending (unpaid) booking cannot be checked in; QR payload contains only reference and issued-at.

S15: As a staff, I want to have forged and repeated scans rejected, so that nobody gets in twice or with a fake
Priority: Must · Build 9 · Source: Tutor · Requirement FR-19 · Rule: one atomic UPDATE, not read-then-write

#	Criterion	Test
S15.1	Given a QR code that was edited or made up
When it is scanned
Then it is rejected as invalid	checkin.test.js forged
S15.2	Given a valid code that has already been scanned
When it is scanned again
Then it is rejected as a duplicate and shows when it was first used	checkin.test.js duplicate
S15.3	Given a booking that was refunded or cancelled
When its code is scanned
Then its code is rejected	checkin.test.js cancelled_refunded
S15.4	Given two staff scan the same code at the same moment
When both requests arrive together
Then exactly one is admitted	checkin.test.js simultaneous
Extra edge-case tests (above benchmark): token signed with the login secret (wrong secret) is rejected; token comparison is constant-time; rate limit stops brute-force scanning.

S16: As a team, I want to run automated tests on every push, so that we notice breakage early
Priority: Should · Builds 2 to 9 · Source: Tutor · Requirements FR-20

#	Criterion	Test / proof
S16.1	Given the project
When someone runs npm test
Then every test runs and the command fails if any test fails. (Build 2)	package.json "test" script; break a test on purpose to prove it fails
S16.2	Given a push to GitHub
When the workflow runs
Then npm test runs automatically, and a failing test shows as a failed check. (Build 9)	.github/workflows/ci.yml; push a failing commit on a throwaway branch and screenshot the red check
4. Screen checks (Build 6)
Stories S05, S06 and S07 must pass on the screen as well as in the API. Build 6 adds these checks (Tutor).

#	Criterion	Proof
B6.1	Given a sold-out tier
When the attendee views the event
Then the tier is marked "Sold out" and cannot be booked	Manual run-through + screenshot
B6.2	Given a declined mock card
When the attendee pays
Then an error is shown and the attendee can try again	Manual run-through + screenshot
B6.3	Given a booking in checkout
When the page is open
Then a countdown shows how long the seats are held	Manual run-through + screenshot
Build 8 adds three more screen checks listed in its "Done when": the refund amount is shown before the attendee confirms a cancel; sold-out tiers offer "Join waitlist"; and waitlist offers show a countdown with an Accept button.

5. Definition of done (every story)
Tutor's four points:

The rule works and has at least one test, including an edge case.
It is reachable the way a user would reach it (API, and screen where it applies).
The AI log has an entry for anything the AI got wrong.
It is merged through a pull request.
Personal tick-list (above benchmark). Before closing any story I also check: (1) every error code named in the criteria has its own test; (2) a failed call leaves the data unchanged; (3) no stack trace or secret reaches the client; (4) the story is traceable in the table in section 7.

6. Stretch stories (Extra, above benchmark)
These come from the tutor's stretch list. They are started only after Build 9's "Done when" list is complete, each on its own branch, and merged only if every benchmark test still passes.

X01: As an organizer, I want a sales dashboard for my events, so that I can see how each event is selling
Priority: Stretch (1st) · After Build 9 · Source: Extra

#	Criterion	Test
X01.1	Given an organizer with published events and paid bookings
When they open the dashboard
Then they see, for each own event, tickets sold, revenue in whole cents (paid minus refunds), per-tier fill rate and number checked in	dashboard.test.js totals
X01.2	Given another organizer's event
When an organizer requests its figures
Then the request is rejected with FORBIDDEN	dashboard.test.js forbidden
X01.3	Given a refunded booking
When the dashboard is shown
Then revenue is reduced by the refunded amount and seats are not counted as sold	dashboard.test.js refunds
X02: As an organizer, I want to cancel a whole event, so that attendees are refunded when it cannot go ahead
Priority: Stretch (2nd) · After Build 9 · Source: Extra · Adds an event status "cancelled"

#	Criterion	Test
X02.1	Given a published event with paid bookings
When the organizer cancels the event
Then every paid booking is refunded 100%, each booking's seats are released once, the waitlist is closed, and the event leaves the public list	event_cancel.test.js refunds_all
X02.2	Given an event that is already cancelled
When the organizer cancels again
Then the request is rejected with INVALID_STATE and nothing is refunded twice	event_cancel.test.js twice
X02.3	Given another organizer's event
When an organizer cancels it
Then the request is rejected with FORBIDDEN	event_cancel.test.js forbidden
X03: As an attendee, I want to use a promo code, so that I pay less when I have a discount
Priority: Stretch (3rd) · After Build 9 · Source: Extra · Introduces error code PROMO_INVALID

#	Criterion	Test
X03.1	Given a valid 10% promo code
When an attendee books with it
Then the total is reduced using Math.floor on cents and the booking records the code	promo.test.js apply
X03.2	Given an expired code or one whose usage limit is reached
When an attendee books with it
Then the request is rejected with PROMO_INVALID and nothing changes	promo.test.js invalid
X03.3	Given a booking paid with a promo code
When it is refunded
Then the refund is calculated on the amount actually paid	promo.test.js refund
X04: As an attendee on a waitlist, I want to see a notification when I am offered a seat, so that I do not miss it
Priority: Stretch (optional) · After Build 9 · Source: Extra · In-app only, no email or SMS

#	Criterion	Test
X04.1	Given an attendee who has just been offered a seat
When they open the site
Then a notification shows the event, the tier and a countdown to the deadline	notify.test.js offer_visible
X04.2	Given an offer that has expired
When they open the site
Then the notification is gone and the seat is not offered to them	notify.test.js expired
7. Traceability matrix
Story to build to requirement to test file. Use this table on the last day to prove nothing was skipped.

Story	Pri.	Build(s)	Requirement	Test file(s)	Reached via
S01	Must	7	FR-01 to FR-03	auth.test.js	API, login.html
S02	Must	2, 4, 7	FR-05	events.test.js, api.test.js	API, organizer.html
S03	Must	2, 4, 7	FR-06	tiers.test.js, api.test.js	API, organizer.html
S04	Must	2, 4, 7	FR-07	events.test.js, api.test.js	API, organizer.html
S05	Must	2, 4, 6	FR-09	search.test.js, api.test.js	API, index.html
S06	Must	2, 4, 6	FR-10	booking.test.js, api.test.js	API, event.html
S07	Must	4, 6	FR-12	pay.test.js	API, event.html
S08	Must	5	FR-11	oversell.test.js	API, npm run oversell
S09	Must	8	FR-13	refund.test.js	API, tickets.html
S10	Must	8	FR-14	expiry.test.js	maintenance job, API
S11	Should	8	FR-15	waitlist.test.js	API, event.html
S12	Should	8	FR-16	waitlist.test.js	API, tickets.html
S13	Must	7	FR-04	access.test.js	API, tickets.html
S14	Must	9	FR-17, FR-18	checkin.test.js	API, checkin.html
S15	Must	9	FR-19	checkin.test.js	API, checkin.html
S16	Should	2 to 9	FR-20	all tests, ci.yml	npm test, GitHub Actions
Test file names are a plan. If the AI tool creates different names, update this table, not the other way round.