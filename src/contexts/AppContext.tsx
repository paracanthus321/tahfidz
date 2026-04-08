import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Santri, Ustadz, Setoran, AppSettings } from '@/types/tahfidz';
import { generateUstadz, generateSantri, generateSetoran } from '@/data/dummy';

interface AppContextType {
  santriList: Santri[];
  ustadzList: Ustadz[];
  setoranList: Setoran[];
  settings: AppSettings;
  setSantriList: (list: Santri[]) => void;
  setUstadzList: (list: Ustadz[]) => void;
  setSetoranList: (list: Setoran[]) => void;
  setSettings: (s: AppSettings) => void;
  addSantri: (s: Santri) => void;
  updateSantri: (s: Santri) => void;
  deleteSantri: (id: string) => void;
  addUstadz: (u: Ustadz) => void;
  updateUstadz: (u: Ustadz) => void;
  deleteUstadz: (id: string) => void;
  addSetoran: (s: Setoran) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

function loadFromStorage<T>(key: string, fallback: () => T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback();
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [ustadzList, setUstadzList] = useState<Ustadz[]>(() => {
    return loadFromStorage('tahfidz_ustadz', () => generateUstadz());
  });
  
  const [santriList, setSantriList] = useState<Santri[]>(() => {
    return loadFromStorage('tahfidz_santri', () => generateSantri(ustadzList));
  });
  
  const [setoranList, setSetoranList] = useState<Setoran[]>(() => {
    return loadFromStorage('tahfidz_setoran', () => generateSetoran(santriList));
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    return loadFromStorage('tahfidz_settings', () => ({
      namaPesantren: 'Pesantren Darul Ilmi',
      logoUrl: '',
      theme: 'default',
    }));
  });

  useEffect(() => { localStorage.setItem('tahfidz_ustadz', JSON.stringify(ustadzList)); }, [ustadzList]);
  useEffect(() => { localStorage.setItem('tahfidz_santri', JSON.stringify(santriList)); }, [santriList]);
  useEffect(() => { localStorage.setItem('tahfidz_setoran', JSON.stringify(setoranList)); }, [setoranList]);
  useEffect(() => { localStorage.setItem('tahfidz_settings', JSON.stringify(settings)); }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    // Remove only theme classes, preserve others
    root.classList.forEach(cls => {
      if (cls.startsWith('theme-')) root.classList.remove(cls);
    });
    if (settings.theme && settings.theme !== 'default') {
      root.classList.add(`theme-${settings.theme}`);
    }
  }, [settings.theme]);

  const addSantri = (s: Santri) => setSantriList(prev => [...prev, s]);
  const updateSantri = (s: Santri) => setSantriList(prev => prev.map(x => x.id === s.id ? s : x));
  const deleteSantri = (id: string) => setSantriList(prev => prev.filter(x => x.id !== id));
  const addUstadz = (u: Ustadz) => setUstadzList(prev => [...prev, u]);
  const updateUstadz = (u: Ustadz) => setUstadzList(prev => prev.map(x => x.id === u.id ? u : x));
  const deleteUstadz = (id: string) => setUstadzList(prev => prev.filter(x => x.id !== id));
  const addSetoran = (s: Setoran) => setSetoranList(prev => [...prev, s]);

  return (
    <AppContext.Provider value={{
      santriList, ustadzList, setoranList, settings,
      setSantriList, setUstadzList, setSetoranList, setSettings,
      addSantri, updateSantri, deleteSantri,
      addUstadz, updateUstadz, deleteUstadz,
      addSetoran,
    }}>
      {children}
    </AppContext.Provider>
  );
};
