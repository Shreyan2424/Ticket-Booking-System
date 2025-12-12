/**
 * Run: node concurrent_test.js
 * This script will attempt N concurrent booking requests against a show.
 */
const axios = require('axios');

const BASE = process.env.BASE || 'http://localhost:4000';
const SHOW_ID = process.env.SHOW_ID || 1;
const CONC = Number(process.env.CONC || 30);
const SEATS_PER = Number(process.env.SEATS || 1);

async function makeBooking(i){
  try {
    const res = await axios.post(BASE + '/bookings', { show_id: Number(SHOW_ID), user_name: 'test'+i, seats: SEATS_PER }, { timeout: 10000 });
    return { ok: true, data: res.data };
  } catch (e){
    if (e.response) return { ok:false, status:e.response.status, data: e.response.data };
    return { ok:false, err: e.message };
  }
}

async function main(){
  const promises = [];
  for (let i=0;i<CONC;i++) promises.push(makeBooking(i));
  const results = await Promise.all(promises);
  const summary = results.reduce((acc,r)=>{
    if (r.ok) acc.confirmed++;
    else if (r.status===409) acc.failed++;
    else acc.other++;
    return acc;
  }, {confirmed:0, failed:0, other:0});
  console.log('Results:', summary);
  console.log(results.slice(0,10));
}

main();
