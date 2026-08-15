'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { CONTACT, NAV_ITEMS } from '@/lib/site';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#4a0072] text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" prefetch={false} className="flex shrink-0 items-center gap-2">
          <Image
            src="/wp-content/uploads/2022/02/LOGO-BRANCA.png"
            alt="TC Telecom"
            width={140}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className="uppercase transition-colors hover:text-purple-200">
              {item.label}
            </Link>
          ))}
          <Link href="/#contato" className="uppercase transition-colors hover:text-purple-200">
            Contato
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[#4a0072] transition-colors hover:bg-purple-100"
          >
            Fale Conosco
          </a>
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-white transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/10 px-4 pb-4 text-sm font-semibold uppercase tracking-wide md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} prefetch={false} className="py-2" onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/#contato" className="py-2" onClick={() => setOpen(false)}>
            Contato
          </Link>
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-white px-5 py-2 text-center font-bold text-[#4a0072]"
          >
            Fale Conosco
          </a>
        </nav>
      )}
    </header>
  );
}
