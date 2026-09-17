'use client';
import { useState, useCallback, useEffect } from 'react';
import { useFormStore } from '@/store/form.store';

/**
 * Remplace useState avec persistance sessionStorage (30 min).
 * Usage : const [val, setVal, reset] = usePersistedForm('page:champ', defaultValue)
 */
export function usePersistedForm<T>(
  key: string,
  defaultValue: T
): [T, (v: T | ((prev: T) => T)) => void, () => void] {
  const { save, load, clear } = useFormStore();

  const [value, setLocalValue] = useState<T>(() => load(key, defaultValue));

  // Resync si la clé change (changement de page ou onglet)
  useEffect(() => {
    setLocalValue(load(key, defaultValue));
  }, [key]);

  const setValue = useCallback((v: T | ((prev: T) => T)) => {
    setLocalValue(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      save(key, next);
      return next;
    });
  }, [key, save]);

  const reset = useCallback(() => {
    setLocalValue(defaultValue);
    clear(key);
  }, [key, defaultValue, clear]);

  return [value, setValue, reset];
}
