"use client";

import { useSyncExternalStore } from "react";

// Quote "cart" kept in localStorage: product ids + indicative quantities + notes.
// No prices anywhere. Names are re-resolved on the quote page in the current language.

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  quantity: number;
  note: string;
};

const KEY = "amenplus.quote.v1";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let cache: CartItem[] | null = null;

function read(): CartItem[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? (parsed as CartItem[]).filter((i) => i && typeof i.productId === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Private mode or storage full: the cart still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useQuoteCart(): CartItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const quoteCart = {
  add(item: Omit<CartItem, "note"> & { note?: string }) {
    const items = read();
    const existing = items.find((i) => i.productId === item.productId);
    if (existing) {
      write(items.map((i) => (i.productId === item.productId ? { ...i, quantity: Math.min(999, i.quantity + item.quantity) } : i)));
    } else {
      write([...items, { note: "", ...item }]);
    }
  },
  update(productId: string, patch: Partial<Pick<CartItem, "quantity" | "note">>) {
    write(read().map((i) => (i.productId === productId ? { ...i, ...patch } : i)));
  },
  remove(productId: string) {
    write(read().filter((i) => i.productId !== productId));
  },
  clear() {
    write([]);
  },
};
