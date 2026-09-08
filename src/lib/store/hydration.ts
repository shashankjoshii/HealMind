"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "./index";

function subscribe(callback: () => void) {
  return useAppStore.persist.onFinishHydration(callback);
}

function getSnapshot() {
  return useAppStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

/**
 * True once the persisted store has rehydrated from localStorage. False
 * during SSR and the first client render, by design: the store's initial
 * state is the seeded demo state (see seed.ts), so server HTML and the
 * first client paint agree exactly. Real user data swaps in the moment
 * this flips to true.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Mount once, near the root, alongside <ThemeProvider>. `skipHydration:
 * true` on the persist config means zustand does NOT read localStorage at
 * module-import time — this component triggers that read manually, after
 * mount, so it can never race React's hydration render.
 */
export function StoreHydrator() {
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);
  return null;
}
