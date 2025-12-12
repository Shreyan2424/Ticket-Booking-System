import React, {useEffect, useState, useRef} from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from './appContext';

export default function Booking(){
  const { id } = useParams();
  const { apiBase, refreshShows, shows } = useApp();
  const [show, setShow] = useState<any>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [name, setName] = useState('User');
  const [msg, setMsg] = useState('');
  const containerRef = useRef<HTMLDivElement|null>(null);

  useEffect(()=>{ if (id) fetchShow(id); },[id]);

  useEffect(()=>{ // when global shows update, refresh local show
    if (!shows || !id) return;
    const s = shows.find(x=>String(x.id)===String(id));
    if (s) setShow(s);
  },[shows,id]);

  async function fetchShow(id:string){
    const res = await fetch(apiBase + '/shows/' + id);
    const data = await res.json();
    setShow(data);
  }

  // build seat map
  function buildSeats(){
    const total = show?.total_seats || 0;
    const booked = show?.seats_booked || 0;
    const seats = [];
    // we'll mark first `booked` seats as booked for demo simplicity
    for (let i=1;i<=total;i++){
      seats.push({id:i, booked: i<=booked});
    }
    return seats;
  }

  function toggleSeat(i:number){
    const already = selectedSeats.includes(i);
    const seatObj = (show?.total_seats && i<=show.total_seats) ? true : false;
    if (!show || i>show.total_seats) return;
    // if seat is considered booked, ignore
    const booked = i <= (show?.seats_booked || 0);
    if (booked) return;
    if (already) setSelectedSeats(s=>s.filter(x=>x!==i));
    else setSelectedSeats(s=>[...s,i]);
  }

  async function book(){
    if (!selectedSeats.length) { setMsg('Select seats first'); return; }
    setMsg('Booking...');
    try {
      // send seats count to backend; backend is seat-agnostic in this demo
      const res = await fetch(apiBase + '/bookings', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ show_id: Number(id), user_name: name, seats: selectedSeats.length })
      });
      const data = await res.json();
      if (res.ok){
        setMsg('Booking '+data.status);
        setSelectedSeats([]);
        await refreshShows();
        setTimeout(()=>fetchShow(String(id)), 500);
      } else {
        setMsg('Failed: ' + (data.error || JSON.stringify(data)));
        await refreshShows();
      }
    } catch (e:any) {
      setMsg('Error: '+e.message);
    }
  }

  if (!show) return <div className="container">Loading show...</div>;
  const seats = buildSeats();
  return (
    <div className="container" ref={containerRef}>
      <h2>Booking - {show.name}</h2>
      <p>Start: {new Date(show.start_time).toLocaleString()}</p>
      <p>Seats: {show.total_seats || 'N/A'} - Booked: {show.seats_booked}</p>

      {show.total_seats ? (
        <>
          <div className="seat-grid" aria-hidden>
            {seats.map(s=>(
              <div
                key={s.id}
                className={"seat "+(s.booked ? 'booked' : (selectedSeats.includes(s.id) ? 'selected' : ''))}
                onClick={()=>toggleSeat(s.id)}
                role="button"
                aria-pressed={selectedSeats.includes(s.id)}
              >
                {s.id}
              </div>
            ))}
          </div>

          <div className="controls">
            <input value={name} onChange={e=>setName(e.target.value)} />
            <button onClick={book}>Book {selectedSeats.length} seat(s)</button>
            <p>{msg}</p>
          </div>
        </>
      ) : (
        <div className="controls">
          <input value={name} onChange={e=>setName(e.target.value)} />
          <button onClick={async ()=>{ // single slot booking
            const res = await fetch(apiBase + '/bookings', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ show_id: Number(id), user_name: name, seats: 1 })});
            const data = await res.json();
            setMsg(res.ok ? 'Booking '+data.status : ('Failed: '+(data.error||JSON.stringify(data))));
            await refreshShows();
          }}>Book Slot</button>
          <p>{msg}</p>
        </div>
      )}
    </div>
  );
}
