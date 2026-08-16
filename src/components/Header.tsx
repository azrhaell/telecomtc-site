'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { NAV_ITEMS, CONTACT, SOCIAL_LINKS } from '@/lib/site';

function SocialIcons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-purple text-white transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-brand-pink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
        </svg>
      </a>
      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-purple text-white transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-brand-pink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={SOCIAL_LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-purple text-white transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-brand-pink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.24 8.25h4.5V23H.24V8.25ZM8.28 8.25h4.31v2.01h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V23h-4.5v-6.4c0-1.53-.03-3.5-2.13-3.5-2.14 0-2.47 1.67-2.47 3.39V23h-4.5V8.25Z" />
        </svg>
      </a>
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden items-center justify-end gap-3 bg-white px-4 py-2 text-sm text-brand-purple sm:flex sm:px-6">
        <span className="font-semibold">Siga-nos em nossas redes:</span>
        <SocialIcons />
      </div>

      <div className="bg-brand-purple text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" prefetch={false} className="flex shrink-0 items-center gap-2">
            <Image
              src="/wp-content/uploads/2022/02/vivo-empresas-parceiro-autorizado.png"
              alt="Vivo Empresas — Parceiro Autorizado"
              width={135}
              height={69}
              priority
              className="h-[69px] w-auto transition-transform hover:scale-[1.04]"
            />
          </Link>

          <nav className="hidden items-center gap-6 text-base font-medium tracking-wide md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={`border-b-2 pb-1 uppercase transition-colors hover:text-purple-200 ${
                  pathname === item.href ? 'border-brand-pink' : 'border-transparent'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/#contato" className="border-b-2 border-transparent pb-1 uppercase transition-colors hover:text-purple-200">
              Contato
            </Link>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <a
              href={CONTACT.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-brand-whatsapp px-4 py-2 text-[15px] font-medium uppercase text-white transition-opacity hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-3-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1s-.7.8-.9 1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5L9 8.9c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 .9-1 2.3s1 2.6 1.1 2.8c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.5-.3Z" />
              </svg>
              Fale Conosco
            </a>
            <Link href="/" prefetch={false} className="flex items-center gap-2">
              <Image
                src="/wp-content/uploads/2022/02/LOGO-BRANCA.png"
                alt="TC Telecom"
                width={207}
                height={78}
                className="h-[78px] w-auto"
              />
            </Link>
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
              className="mt-2 rounded-full bg-brand-whatsapp px-5 py-2 text-center font-bold text-white"
            >
              Fale Conosco
            </a>
            <SocialIcons className="justify-center pt-3" />
          </nav>
        )}
      </div>
    </header>
  );
}
