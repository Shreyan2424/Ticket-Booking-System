require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple health
app.get('/health', (req, res) => res.json({ok: true}));

// Admin: create a show/trip/slot
app.post('/admin/shows', async (req, res) => {
  try {
    const {name, start_time, total_seats, type} = req.body;
    if (!name || !start_time) return res.status(400).json({error: 'name and start_time required'});
    const result = await db.query(
      'INSERT INTO shows(name, start_time, total_seats, seats_booked, type) VALUES($1,$2,$3,0,$4) RETURNING *',
      [name, start_time, total_seats || null, type || 'generic']
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

// List shows
app.get('/shows', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM shows ORDER BY start_time');
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

// Get show by id
app.get('/shows/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const result = await db.query('SELECT * FROM shows WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({error: 'not found'});
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

// Book seats endpoint
// Body: show_id, user_name, seats (number)
app.post('/bookings', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const {show_id, user_name, seats} = req.body;
    if (!show_id || !user_name || !seats) return res.status(400).json({error: 'show_id, user_name and seats required'});
    await client.query('BEGIN');
    // lock the show row to prevent race conditions
    const showRes = await client.query('SELECT * FROM shows WHERE id=$1 FOR UPDATE', [show_id]);
    if (showRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({error: 'show not found'});
    }
    const show = showRes.rows[0];
    const available = (show.total_seats || 0) - show.seats_booked;
    // create a PENDING booking first
    const createRes = await client.query(
      'INSERT INTO bookings(show_id, user_name, seats_requested, status) VALUES($1,$2,$3,$4) RETURNING *',
      [show_id, user_name, seats, 'PENDING']
    );
    const booking = createRes.rows[0];
    if (available >= seats) {
      // enough seats: confirm and update seats_booked
      const newBooked = show.seats_booked + seats;
      await client.query('UPDATE shows SET seats_booked=$1 WHERE id=$2', [newBooked, show_id]);
      await client.query('UPDATE bookings SET status=$1 WHERE id=$2', ['CONFIRMED', booking.id]);
      await client.query('COMMIT');
      const final = await db.query('SELECT * FROM bookings WHERE id=$1', [booking.id]);
      return res.json(final.rows[0]);
    } else {
      // not enough seats
      await client.query('UPDATE bookings SET status=$1 WHERE id=$2', ['FAILED', booking.id]);
      await client.query('COMMIT');
      const final = await db.query('SELECT * FROM bookings WHERE id=$1', [booking.id]);
      return res.status(409).json({error: 'not enough seats', booking: final.rows[0]});
    }
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({error: e.message});
  } finally {
    client.release();
  }
});

// Get booking
app.get('/bookings/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const result = await db.query('SELECT * FROM bookings WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({error: 'not found'});
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({error: e.message});
  }
});

// Background job: expire pending bookings older than 2 minutes
setInterval(async () => {
  try {
    const expire = await db.query(
      "UPDATE bookings SET status='FAILED' WHERE status='PENDING' AND created_at < NOW() - INTERVAL '2 minutes' RETURNING *"
    );
    if (expire.rowCount > 0) {
      console.log('Expired bookings count:', expire.rowCount);
    }
  } catch (e) {
    console.error('Expire job error', e);
  }
}, 30*1000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on port', PORT));
