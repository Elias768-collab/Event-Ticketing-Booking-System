
import { createDatabase } from "../src/db/connection.js";
import { createSQLiteRepository } from "../src/repositories/sqlite.js";

const db = createDatabase({
    path: process.env.DATABASE_PATH || undefined,
});
const repository = createSQLiteRepository(db);

try {
    // Check whether the database already contains events.
    const existingEvents = await repository.listEvents();

    if (existingEvents.length > 0) {
        console.log("Database already contains events. Seeding skipped.");
    } else {
        // Create a sample event.
        const event = await repository.createEvent({
            title: "Backend Developers Conference",
            city: "Lagos",
            venue: "Landmark Centre",
            date: "2027-04-20",
        });

        // Create two ticket tiers.
        await repository.createTier(event.id, {
            name: "Regular",
            priceCents: 500000,
            capacity: 100,
        });

        await repository.createTier(event.id, {
            name: "VIP",
            priceCents: 1500000,
            capacity: 30,
        });

        // Publish the event so it appears in the public event listing.
        await repository.publishEvent(event.id);

        console.log("Database seeded successfully.");
        console.log("Created event:", event.title);
    }
} catch (error) {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
} finally {
    repository.close();
}
