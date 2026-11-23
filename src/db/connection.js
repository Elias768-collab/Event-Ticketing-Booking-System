
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

// Store the database in the project's data directory.
const DEFAULT_DATABASE_PATH = resolve(
    currentDirectory,
    "../../data/ticketing.sqlite"
);

export function createDatabase({
    path = DEFAULT_DATABASE_PATH,
} = {}) {
    // Create the directory if it does not exist.
    mkdirSync(dirname(path), { recursive: true });

    // Open an existing database or create a new one.
    const db = new DatabaseSync(path);

    // Enable foreign-key enforcement.
    db.exec("PRAGMA foreign_keys = ON");

    // Wait up to 5 seconds if the database is busy.
    db.exec("PRAGMA busy_timeout = 5000");

    // Load and execute the database schema.
    const schema = readFileSync(
        new URL("./schema.sql", import.meta.url),
        "utf8"
    );

    db.exec(schema);

    return db;
}
