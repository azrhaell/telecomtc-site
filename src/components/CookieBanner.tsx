'use client';

import { useSyncExternalStore } from 'react';
import { COOKIE_NOTICE } from '@/lib/site';

const STORAGE_KEY = 'cookie-notice-accepted';
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

function getServerSnapshot() {
  return true; // no servidor, assume aceito para não piscar o banner no SSR/export
}

function accept() {
  window.localStorage.setItem(STORAGE_KEY, '1');
  listeners.forEach((callback) => callback());
}

export default function CookieBanner() {
  const accepted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (accepted) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 bg-[#4e196c] px-4 py-3 text-center text-sm text-white sm:flex-row sm:justify-center">
      <p className="max-w-3xl">{COOKIE_NOTICE}</p>
      <button
        type="button"
        onClick={accept}
        className="shrink-0 rounded bg-brand-pink px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Aceitar
      </button>
      <button
        type="button"
        onClick={accept}
        aria-label="Fechar"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white sm:static sm:translate-y-0"
      >
        ×
      </button>
    </div>
  );
}
