
import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { createDatabase } from "../src/db/connection.js";
import { createSQLiteRepository } from "../src/repositories/sqlite.js";

const databasePath = resolve("data/oversell-demo.sqlite");

// Start each demonstration with a fresh database.
rmSync(databasePath, { force: true });

const db = createDatabase({ path: databasePath });
const repository = createSQLiteRepository(db);

try {
    const event = await repository.createEvent({
        title: "Overselling Demonstration",
        city: "Lagos",
        venue: "Test Venue",
        date: "2027-03-15",
    });

    const tier = await repository.createTier(event.id, {
        name: "Regular",
        priceCents: 500000,
        capacity: 1,
    });

    console.log("Initial available seats:", tier.capacity - tier.sold);
    console.log("Booking attempts: 50");
    console.log("Sending booking requests concurrently...\n");

    const results = await Promise.allSettled(
        Array.from({ length: 50 }, (_, index) =>
            repository.createPendingBooking(
                tier.id,
                1,
                `demo-user-${index + 1}`
            )
        )
    );

    const successfulBookings = results.filter(
        result => result.status === "fulfilled"
    );

    const failedBookings = results.filter(
        result => result.status === "rejected"
    );

    const soldOutBookings = failedBookings.filter(
        result => result.reason.code === "SOLD_OUT"
    );

    const updatedTier = await repository.findTierById(tier.id);

    const bookingCount = db.prepare(`
        SELECT COUNT(*) AS total
        FROM bookings
        WHERE tier_id = ?
    `).get(tier.id).total;

    console.log("\nDEMONSTRATION RESULTS");
    console.log("---------------------");
    console.log("Successful bookings:", successfulBookings.length);
    console.log("Failed bookings:", failedBookings.length);
    console.log("SOLD_OUT responses:", soldOutBookings.length);
    console.log("Seats sold:", updatedTier.sold);
    console.log("Booking records created:", bookingCount);
    console.log("Available seats:", updatedTier.capacity - updatedTier.sold);

} finally {
    repository.close();
}
