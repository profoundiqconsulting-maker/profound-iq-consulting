import { useEffect, useMemo, useState } from "react";

const ADMIN_TABLE_STORAGE_PREFIX = "profound-iq-admin-table";

function storageKey(prefix: string, key: string) {
  return `${ADMIN_TABLE_STORAGE_PREFIX}:${prefix}:${key}`;
}

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota or private-mode failures
  }
}

type TableStateShape = Record<string, unknown>;
type ValueUpdater<T> = T | ((prev: T) => T);

export function useAdminTableState<T extends TableStateShape>(
  prefix: string,
  initialState: T,
  options?: { persistedKeys?: (keyof T)[] }
) {
  const persistedKeys = options?.persistedKeys ?? Object.keys(initialState);

  const hydrated = useMemo(() => {
    const next: TableStateShape = { ...initialState };
    for (const key of persistedKeys) {
      const stored = readStoredValue(storageKey(prefix, String(key)), initialState[key]);
      next[key] = stored;
    }
    return next as T;
  }, [prefix]); // intentionally only on prefix change

  const [state, setState] = useState<T>(hydrated);

  useEffect(() => {
    for (const key of persistedKeys) {
      writeStoredValue(storageKey(prefix, String(key)), (state as TableStateShape)[key]);
    }
  }, [prefix, state, persistedKeys, initialState]);

  const setValue = <K extends keyof T>(key: K, updater: ValueUpdater<T[K]>) => {
    setState(prev => {
      const nextValue =
        typeof updater === "function"
          ? (updater as (prev: T[K]) => T[K])(prev[key])
          : updater;
      return { ...prev, [key]: nextValue };
    });
  };

  const reset = () => setState(initialState);

  return { state, setState, setValue, reset } as const;
}
