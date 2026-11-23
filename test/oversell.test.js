
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createDatabase } from "../src/db/connection.js";
import { createSQLiteRepository } from "../src/repositories/sqlite.js";

test("S08: only one of 50 simultaneous bookings can reserve the last ticket", async (t) => {
    // Create an isolated temporary database for this test.
    const directory = mkdtempSync(join(tmpdir(), "ticketing-oversell-"));

    const db = createDatabase({
        path: join(directory, "test.sqlite"),
    });

    const repository = createSQLiteRepository(db);

    // Always close the database and remove temporary files.
    t.after(() => {
        repository.close();
        rmSync(directory, { recursive: true, force: true });
    });

    // Create an event.
    const event = await repository.createEvent({
        title: "Concurrency Test Event",
        city: "Lagos",
        venue: "Test Venue",
        date: "2027-03-15",
    });

    // Create a ticket tier with exactly one seat.
    const tier = await repository.createTier(event.id, {
        name: "Regular",
        priceCents: 500000,
        capacity: 1,
    });

    // Attempt 50 bookings simultaneously.
    const results = await Promise.allSettled(
        Array.from({ length: 50 }, (_, index) =>
            repository.createPendingBooking(
                tier.id,
                1,
                `test-user-${index + 1}`
            )
        )
    );

    const successfulBookings = results.filter(
        result => result.status === "fulfilled"
    );

    const failedBookings = results.filter(
        result => result.status === "rejected"
    );

    const updatedTier = await repository.findTierById(tier.id);

    const bookingCount = db.prepare(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE tier_id = ?
    `).get(tier.id).total;

    // Exactly one booking must succeed.
    assert.equal(successfulBookings.length, 1);

    // The other 49 must fail with SOLD_OUT.
    assert.equal(failedBookings.length, 49);

    for (const result of failedBookings) {
        assert.equal(result.reason.code, "SOLD_OUT");
    }

    // Inventory must never exceed capacity.
    assert.equal(updatedTier.sold, 1);
    assert.equal(updatedTier.sold <= updatedTier.capacity, true);

    // Only one booking record must exist.
    assert.equal(bookingCount, 1);
});
