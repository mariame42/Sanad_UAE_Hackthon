/**
 * Tiny external store backed by Web Storage, for useSyncExternalStore.
 * localStorage-backed stores also sync across tabs (storage event), so a
 * split-screen demo (Faculty in one window, Advisor in another) updates live.
 */

type Listener = () => void;

export type PersistentStore<T> = {
  get: () => T;
  getServer: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  subscribe: (listener: Listener) => () => void;
  reset: () => void;
};

export function createPersistentStore<T>(
  key: string,
  initial: T,
  storage: "local" | "session" = "local",
): PersistentStore<T> {
  let state = initial;
  let loaded = false;
  const listeners = new Set<Listener>();

  const area = () =>
    storage === "local" ? window.localStorage : window.sessionStorage;

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = area().getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* private mode or corrupt value: keep initial */
    }
    if (storage === "local") {
      window.addEventListener("storage", (e) => {
        if (e.key !== key) return;
        try {
          state = e.newValue ? (JSON.parse(e.newValue) as T) : initial;
        } catch {
          state = initial;
        }
        listeners.forEach((l) => l());
      });
    }
  }

  function set(next: T | ((prev: T) => T)) {
    load();
    state =
      typeof next === "function" ? (next as (prev: T) => T)(state) : next;
    try {
      area().setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota / private mode */
    }
    listeners.forEach((l) => l());
  }

  return {
    get: () => {
      load();
      return state;
    },
    getServer: () => initial,
    set,
    subscribe: (listener) => {
      load();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset: () => set(initial),
  };
}
