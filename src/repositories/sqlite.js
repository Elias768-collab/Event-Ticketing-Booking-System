
import { DomainError } from "../domain/errors.js";
import {
    createStore,
    createEvent as createDomainEvent,
    addTier as addDomainTier,
    publishEvent as publishDomainEvent,
    listEventSummaries,
    createPendingBooking as createDomainPendingBooking,
} from "../domain/inventory.js";

function mapEvent(row) {
    if (!row) return null;

    return {
        id: row.id,
        title: row.title,
        city: row.city,
        venue: row.venue,
        date: row.date,
        status: row.status,
    };
}

function mapTier(row) {
    if (!row) return null;

    return {
        id: row.id,
        eventId: row.event_id,
        name: row.name,
        priceCents: row.price_cents,
        capacity: row.capacity,
        sold: row.sold,
    };
}

function mapBooking(row) {
    if (!row) return null;

    return {
        id: row.id,
        reference: row.reference,
        tierId: row.tier_id,
        userId: row.user_id,
        quantity: row.quantity,
        amountCents: row.amount_cents,
        status: row.status,
        transactionId: row.transaction_id,
    };
}

export function createSQLiteRepository(db) {
    if (!db) {
        throw new Error("A SQLite database connection is required.");
    }

    function getBookingById(bookingId) {
        const row = db.prepare(
            "SELECT * FROM bookings WHERE id = ?"
        ).get(bookingId);

        return mapBooking(row);
    }

    function getStoreForDomainOperations() {
        const store = createStore();

        const events = db.prepare(
            "SELECT * FROM events"
        ).all();

        const tiers = db.prepare(
            "SELECT * FROM ticket_tiers"
        ).all();

        for (const row of events) {
            const event = mapEvent(row);
            store.events.set(event.id, event);
        }

        for (const row of tiers) {
            const tier = mapTier(row);
            store.tiers.set(tier.id, tier);
        }

        return store;
    }

    function insertBooking(booking) {
        db.prepare(`
            INSERT INTO bookings (
                id,
                reference,
                tier_id,
                user_id,
                quantity,
                amount_cents,
                status,
                transaction_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            booking.id,
            booking.reference,
            booking.tierId,
            booking.userId,
            booking.quantity,
            booking.amountCents,
            booking.status,
            booking.transactionId
        );
    }

    return {
        // -------------------------
        // Events
        // -------------------------

        async createEvent(details) {
            const store = createStore();
            const event = createDomainEvent(store, details);

            db.prepare(`
                INSERT INTO events (
                    id, title, city, venue, date, status
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                event.id,
                event.title,
                event.city,
                event.venue,
                event.date,
                event.status
            );

            return event;
        },

        async findEventById(eventId) {
            const row = db.prepare(
                "SELECT * FROM events WHERE id = ?"
            ).get(eventId);

            return mapEvent(row);
        },

        async listEvents() {
            return db.prepare(
                "SELECT * FROM events"
            ).all().map(mapEvent);
        },

        async publishEvent(eventId) {
            const store = getStoreForDomainOperations();

            const event = publishDomainEvent(store, eventId);

            db.prepare(`
                UPDATE events
                SET status = ?
                WHERE id = ?
            `).run(event.status, eventId);

            return event;
        },

        async listEventSummaries(options = {}) {
            const store = getStoreForDomainOperations();

            return listEventSummaries(store, options);
        },

        // -------------------------
        // Ticket tiers
        // -------------------------

        async createTier(eventId, details) {
            const store = getStoreForDomainOperations();

            const tier = addDomainTier(store, eventId, details);

            db.prepare(`
                INSERT INTO ticket_tiers (
                    id,
                    event_id,
                    name,
                    price_cents,
                    capacity,
                    sold
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(
                tier.id,
                tier.eventId,
                tier.name,
                tier.priceCents,
                tier.capacity,
                tier.sold
            );

            return tier;
        },

        async findTierById(tierId) {
            const row = db.prepare(
                "SELECT * FROM ticket_tiers WHERE id = ?"
            ).get(tierId);

            return mapTier(row);
        },

        async listTiersByEventId(eventId) {
            return db.prepare(
                "SELECT * FROM ticket_tiers WHERE event_id = ?"
            ).all(eventId).map(mapTier);
        },

        // -------------------------
        // Bookings
        // -------------------------

        async createBooking(booking) {
            db.prepare(
                "INSERT OR IGNORE INTO users (id) VALUES (?)"
            ).run(booking.userId);

            insertBooking(booking);

            return booking;
        },

        async createPendingBooking(tierId, quantity, userId) {
            const row = db.prepare(
                "SELECT * FROM ticket_tiers WHERE id = ?"
            ).get(tierId);

            if (!row) {
                throw new DomainError(
                    "NOT_FOUND",
                    "Ticket tier not found."
                );
            }

            // Reuse existing domain validation.
            const store = createStore();
            store.tiers.set(tierId, mapTier(row));

            const booking = createDomainPendingBooking(
                store,
                tierId,
                quantity,
                userId
            );

            // Begin a database transaction.
            db.exec("BEGIN IMMEDIATE");

            try {
                // Reserve tickets only if sufficient capacity remains.
                const reservation = db.prepare(`
                    UPDATE ticket_tiers
                    SET sold = sold + ?
                    WHERE id = ?
                    AND sold + ? <= capacity
                `).run(quantity, tierId, quantity);

                // Zero changed rows means the reservation failed.
                if (reservation.changes === 0) {
                    throw new DomainError(
                        "SOLD_OUT",
                        "Not enough tickets available."
                    );
                }

                // Ensure the user exists before inserting the booking.
                db.prepare(
                    "INSERT OR IGNORE INTO users (id) VALUES (?)"
                ).run(userId);

                // Save the booking only after successfully reserving tickets.
                insertBooking(booking);

                db.exec("COMMIT");

                return booking;
            } catch (error) {
                db.exec("ROLLBACK");
                throw error;
            }
        },

        async createPendingBooking(tierId, quantity, userId) {
            const row = db.prepare(
                "SELECT * FROM ticket_tiers WHERE id = ?"
            ).get(tierId);

            if (!row) {
                throw new DomainError(
                    "NOT_FOUND",
                    "Ticket tier not found."
                );
            }

            // Reuse existing domain validation.
            const store = createStore();
            store.tiers.set(tierId, mapTier(row));

            const booking = createDomainPendingBooking(
                store,
                tierId,
                quantity,
                userId
            );

            // Begin a database transaction.
            db.exec("BEGIN IMMEDIATE");
            try {
                // Reserve tickets only if sufficient capacity remains.
                const reservation = db.prepare(`
                    UPDATE ticket_tiers
                    SET sold = sold + ?
                    WHERE id = ?
                    AND sold + ? <= capacity
                `).run(quantity, tierId, quantity);

                // Zero changed rows means the reservation failed.
                if (reservation.changes === 0) {
                    throw new DomainError(
                        "SOLD_OUT",
                        "Not enough tickets available."
                    );
                }

                // Ensure the user exists before inserting the booking.
                db.prepare(
                    "INSERT OR IGNORE INTO users (id) VALUES (?)"
                ).run(userId);

                // Save the booking only after successfully reserving tickets.
                insertBooking(booking);

                db.exec("COMMIT");

                return booking;
            } catch (error) {
                db.exec("ROLLBACK");
                throw error;
            }
        },
  
        async cancelPendingBooking(bookingId) {
            const booking = getBookingById(bookingId);

            if (!booking) {
                throw new DomainError(
                    "NOT_FOUND",
                    "Booking not found."
                );
            }

            db.exec("BEGIN IMMEDIATE");

            try {
                db.prepare(`
                    UPDATE ticket_tiers
                    SET sold = sold - ?
                    WHERE id = ? AND sold >= ?
                `).run(
                    booking.quantity,
                    booking.tierId,
                    booking.quantity
                );

                db.prepare(`
                    UPDATE bookings
                    SET status = ?
                    WHERE id = ? AND status = ?
                `).run("cancelled", bookingId, "pending");

                db.exec("COMMIT");
            } catch (error) {
                db.exec("ROLLBACK");
                throw error;
            }

            return getBookingById(bookingId);
        },

        async findBookingByReference(reference) {
            const row = db.prepare(
                "SELECT * FROM bookings WHERE reference = ?"
            ).get(reference);

            return mapBooking(row);
        },

        async saveBooking(booking) {
            const result = db.prepare(`
                UPDATE bookings
                SET status = ?, transaction_id = ?
                WHERE id = ?
            `).run(
                booking.status,
                booking.transactionId,
                booking.id
            );

            if (result.changes === 0) {
                throw new DomainError(
                    "NOT_FOUND",
                    "Booking not found."
                );
            }

            return booking;
        },

        // Close the connection when the application shuts down.
        close() {
            db.close();
        },
    };
}
