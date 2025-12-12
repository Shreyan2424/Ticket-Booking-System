# Ticket Booking System - Full Project (Minimal)

This archive contains a minimal implementation of the backend (Node.js + Express + Postgres) and a frontend skeleton (React + TypeScript).
It demonstrates:
- API endpoints to create shows and book seats
- Concurrency control using Postgres transactions + SELECT ... FOR UPDATE
- Background job to expire pending bookings after 2 minutes
- A small React app to interact with the API

## How to run (quick)
1. Start Postgres locally and create database `ticketdb`
2. Run schema: `psql -U postgres -d ticketdb -f backend/schema.sql`
3. Configure `backend/.env` DATABASE_URL
4. Start backend:
   ```
   cd backend
   npm install
   npm start
   ```
5. Start frontend:
   ```
   cd frontend
   npm install
   npm start
   ```
6. Open frontend at http://localhost:5173 (Vite default) and ensure backend at http://localhost:4000

## Technical write-up (short)
See `ARCHITECTURE.md` for a short document describing scaling, DB design, concurrency, caching and message queue ideas.
