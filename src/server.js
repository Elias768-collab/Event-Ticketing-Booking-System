
import { createServer } from "node:http";

import { createApp } from "./http/app.js";
import { config } from "./config.js";
import { createDatabase } from "./db/connection.js";
import { createSQLiteRepository } from "./repositories/sqlite.js";

// Create the SQLite database connection.
const db = createDatabase();

// Create the SQLite repository.
const repository = createSQLiteRepository(db);

// Pass the SQLite repository into the application.
const app = createApp({ repository });

// Create the HTTP server.
const server = createServer(app);

// Start listening for incoming requests.
server.listen(config.port, () => {
    console.log(
        `Event Ticketing System running at http://localhost:${config.port}`
    );

    console.log("Database: SQLite");
});

// Gracefully shut down the server and database connection.
function shutdown() {
    console.log("\nShutting down server...");

    server.close((error) => {
        if (error) {
            console.error("Server shutdown error:", error);
            process.exitCode = 1;
        }

        repository.close();
        console.log("Database connection closed.");
    });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
