import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Shows from './shows';
import Admin from './admin';
import Booking from './booking';
import { AppProvider } from './appContext';
import './styles.css';

function App(){
  return (
    <AppProvider>
      <BrowserRouter>
        <nav className="nav">
          <Link to="/">Shows</Link> | <Link to="/admin">Admin</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Shows/>}/>
          <Route path="/admin" element={<Admin/>}/>
          <Route path="/booking/:id" element={<Booking/>}/>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
