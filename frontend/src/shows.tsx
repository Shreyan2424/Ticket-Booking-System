import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from './appContext';

export default function Shows(){
  const { shows } = useApp();
  return (
    <div className="container">
      <h2>Available Shows</h2>
      {shows.length===0 && <p>No shows</p>}
      <ul>
        {shows.map(s=>(
          <li key={s.id}>
            <strong>{s.name}</strong> ({s.type}) - Seats: {s.total_seats || 'N/A'} - Booked: {s.seats_booked}
            {' '}<Link to={'/booking/'+s.id}>Book</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
