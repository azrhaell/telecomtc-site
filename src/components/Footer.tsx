import Image from 'next/image';
import { COMPANY_LEGAL, CONTACT, SOCIAL_LINKS } from '@/lib/site';

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-purple" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  phone: 'M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.5 21 3 13.5 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8Z',
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-3-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1s-.7.8-.9 1c-.2.2-.3.2-.6.1a6.6 6.6 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.4 0-.5L9 8.9c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-1 .9-1 2.3s1 2.6 1.1 2.8c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.5-.3Z',
  mail: 'M2 5h20v14H2V5Zm2 2v.5l8 5.5 8-5.5V7l-8 5-8-5Z',
  pin: 'M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z',
} as const;

export default function Footer() {
  return (
    <footer className="bg-white text-zinc-700">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 border-b border-zinc-200 pb-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Icon path={ICONS.phone} />
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Nos encontre no telefone:</p>
              <a href={CONTACT.phoneHref} className="font-semibold text-brand-purple hover:underline">
                {CONTACT.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon path={ICONS.whatsapp} />
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Nos chame no WhatsApp:</p>
              <a
                href={CONTACT.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-purple hover:underline"
              >
                {CONTACT.whatsappNumber}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon path={ICONS.mail} />
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Envie um e-mail para:</p>
              <a href={`mailto:${CONTACT.email}`} className="font-semibold text-brand-purple hover:underline">
                {CONTACT.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Icon path={ICONS.pin} />
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Estamos em:</p>
              <p className="font-semibold text-brand-purple">{CONTACT.address}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <Image
            src="/wp-content/uploads/2022/02/LOFO-OFICIAL.png"
            alt="TC Telecom"
            width={140}
            height={40}
            className="h-9 w-auto"
          />
          <div className="flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple text-white transition-all hover:-translate-y-0.5 hover:bg-brand-pink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple text-white transition-all hover:-translate-y-0.5 hover:bg-brand-pink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
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
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-purple text-white transition-all hover:-translate-y-0.5 hover:bg-brand-pink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.9 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.24 8.25h4.5V23H.24V8.25ZM8.28 8.25h4.31v2.01h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V23h-4.5v-6.4c0-1.53-.03-3.5-2.13-3.5-2.14 0-2.47 1.67-2.47 3.39V23h-4.5V8.25Z" />
              </svg>
            </a>
          </div>
        </div>

        <p className="border-t border-zinc-200 pt-6 text-center text-xs text-zinc-500">{COMPANY_LEGAL}</p>
      </div>
    </footer>
  );
}
