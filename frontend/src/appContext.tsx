import React, { createContext, useContext, useState, useEffect } from 'react';

type AppContextType = {
  apiBase: string;
  refreshShows: ()=>Promise<void>;
  shows: any[];
  setShows: (s:any[])=>void;
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const apiBase = (import.meta.env.VITE_API_BASE || 'http://localhost:4000');
  const [shows, setShows] = useState<any[]>([]);

  async function refreshShows(){
    try {
      const res = await fetch(apiBase + '/shows');
      const data = await res.json();
      setShows(data);
    } catch (e) {
      console.error('refreshShows', e);
    }
  }

  useEffect(()=>{ refreshShows(); const t = setInterval(refreshShows, 5000); return ()=>clearInterval(t); },[]);

  return <AppContext.Provider value={{apiBase, refreshShows, shows, setShows}}>{children}</AppContext.Provider>
};

export function useApp(){
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
