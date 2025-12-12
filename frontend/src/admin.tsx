import React, {useState} from 'react';

export default function Admin(){
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [total, setTotal] = useState<number | ''>('');
  const [msg, setMsg] = useState('');
  async function create(){
    const body: any = { name, start_time: start };
    if (total !== '') body.total_seats = total;
    const res = await fetch(import.meta.env.VITE_API_BASE + '/admin/shows',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if (res.ok){ setMsg('Created'); setName(''); setStart(''); setTotal(''); }
    else { const e = await res.json(); setMsg('Error: '+(e.error||JSON.stringify(e))) }
  }
  return (
    <div style={{padding:20}}>
      <h2>Admin - Create Show</h2>
      <div>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)}/>
        <input placeholder="Start time (ISO)" value={start} onChange={e=>setStart(e.target.value)}/>
        <input placeholder="Total seats (number)" value={total as any} onChange={e=>setTotal(e.target.value?Number(e.target.value):'')}/>
        <button onClick={create}>Create</button>
      </div>
      <p>{msg}</p>
    </div>
  );
}
