import { create } from 'zustand';

const TTL = 30 * 60 * 1000; // 30 minutes

interface Entry { value: any; savedAt: number }
interface FormState {
  save:  (key: string, value: any) => void;
  load:  (key: string, def: any)   => any;
  clear: (key: string)             => void;
}

// Stockage dans sessionStorage (fermeture d'onglet = effacé)
const storage = {
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() })); } catch {}
  },
  get: (key: string, def: any) => {
    if (typeof window === 'undefined') return def;
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return def;
      const entry: Entry = JSON.parse(raw);
      if (Date.now() - entry.savedAt > TTL) { sessionStorage.removeItem(key); return def; }
      return entry.value;
    } catch { return def; }
  },
  del: (key: string) => {
    if (typeof window !== 'undefined') { try { sessionStorage.removeItem(key); } catch {} }
  },
};

export const useFormStore = create<FormState>()(() => ({
  save:  (key, value) => storage.set(key, value),
  load:  (key, def)   => storage.get(key, def),
  clear: (key)        => storage.del(key),
}));
