# Backend - Ticket Booking System

## Tech
Node.js, Express, Postgres (pg)

## Setup
1. Install dependencies:
   ```
   cd backend
   npm install
   ```
2. Ensure Postgres is running and create a database `ticketdb`. Example:
   ```
   psql -U postgres -c "CREATE DATABASE ticketdb;"
   psql -U postgres -d ticketdb -f schema.sql
   ```
3. Copy `.env.example` to `.env` and set `DATABASE_URL`.
4. Start server:
   ```
   npm start
   ```

## Endpoints
- `GET /health` - healthcheck
- `POST /admin/shows` - create a show `{ name, start_time, total_seats, type }`
- `GET /shows` - list shows
- `GET /shows/:id` - get show by id
- `POST /bookings` - book seats `{ show_id, user_name, seats }`
- `GET /bookings/:id` - get booking

## Concurrency control
Booking uses Postgres transactions with `SELECT ... FOR UPDATE` on the show row to prevent race conditions and overbooking.
A background job expires `PENDING` bookings older than 2 minutes.

