-- Run this to create the database schema (e.g., psql -d ticketdb -f schema.sql)
CREATE TABLE IF NOT EXISTS shows (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  start_time TIMESTAMP NOT NULL,
  total_seats INTEGER,
  seats_booked INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  seats_requested INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL, -- PENDING, CONFIRMED, FAILED
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample data
INSERT INTO shows(name, type, start_time, total_seats) VALUES ('Demo Show 1', 'movie', NOW() + INTERVAL '1 hour', 40) ON CONFLICT DO NOTHING;
