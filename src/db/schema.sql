
-- Users who create bookings.
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Events created by organisers.
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    city TEXT NOT NULL,
    venue TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published'))
);

-- Ticket categories belonging to events.
CREATE TABLE IF NOT EXISTS ticket_tiers (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL
        CHECK (price_cents >= 0),
    capacity INTEGER NOT NULL
        CHECK (capacity > 0),
    sold INTEGER NOT NULL DEFAULT 0
        CHECK (sold >= 0 AND sold <= capacity),

    FOREIGN KEY (event_id)
        REFERENCES events(id),

    UNIQUE (event_id, name)
);

-- Bookings made by users.
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    tier_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    quantity INTEGER NOT NULL
        CHECK (quantity BETWEEN 1 AND 10),
    amount_cents INTEGER NOT NULL
        CHECK (amount_cents >= 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'paid',
                'cancelled',
                'refunded',
                'checked_in'
            )
        ),
    transaction_id TEXT UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tier_id)
        REFERENCES ticket_tiers(id),

    FOREIGN KEY (user_id)
        REFERENCES users(id)
);
